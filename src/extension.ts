import * as vscode from 'vscode';

import { InstalledPackagesView } from './views/InstalledPackagesView';
import { NugetManager } from './manager/NugetManager';
import { DotnetManager } from './manager/DotnetManager';
import { PackageResolver } from './resolver/PackageResolver';
import { WorkspaceManager } from './manager/WorkspaceManager';
import { searchService } from './NugetApi/SearchService';
import { NugetPackageTreeItem } from './views/TreeItems/NugetPackageTreeItem';
import { ShowProgressPopup } from './utils';


export function activate(context: vscode.ExtensionContext) {
    extensionManager.start();
}

export class ExtensionManager {

    outputChannel = vscode.window.createOutputChannel('NuGet');

    workspaces = vscode.workspace.workspaceFolders;
    workspaceManagers: WorkspaceManager[] = [];

    installedPackagesView = new InstalledPackagesView(this.workspaceManagers);

    start() {

        if (!this.workspaces || this.workspaces.length < 1) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        this.workspaces.forEach((worksapce: vscode.WorkspaceFolder) => {
            const resolver = new PackageResolver(worksapce.uri.fsPath);
            const nugetManager = new NugetManager(
                new DotnetManager(this.outputChannel, worksapce),
                this.installedPackagesView
            );
            this.workspaceManagers.push(new WorkspaceManager(worksapce, resolver, nugetManager));
        });

        // Only show NuGet View Container if any workspace contains a valid project file
        if (this.workspaceManagers.filter(manager => manager.resolver.isValidWorkspace()).length) {
            this.registerViewAndCommands();
        }
    }

    registerViewAndCommands() {

        // Set context to enable activity bar view container.
        vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

        vscode.window.registerTreeDataProvider('nuget-installed', this.installedPackagesView);

        vscode.commands.registerCommand('nuget-explorer.refresh', () => this.installedPackagesView.refresh());
        vscode.commands.registerCommand('nuget-explorer.install', (item: NugetPackageTreeItem) => this.managePackageInstall(item));
        vscode.commands.registerCommand('nuget-explorer.uninstall', (item: NugetPackageTreeItem) => item.manager.nugetManager.uninstall(item));

    }

    async managePackageInstall(item?: NugetPackageTreeItem) {

        const packages = await searchService.search();

        if (!packages) { return; }

        if (item) {
            await ShowProgressPopup('NuGet Installing Packages', () => item.manager.nugetManager.installPackages(packages));
        } else if (this.workspaceManagers.length === 1) {
            await ShowProgressPopup('NuGet Installing Packages', () => this.workspaceManagers[0].nugetManager.installPackages(packages));
        } else {
            const selected = await vscode.window.showQuickPick<WorkspaceManager>(
                this.workspaceManagers, { canPickMany: true, placeHolder: 'Select Projects' });

            if (selected && selected.length) {
                await ShowProgressPopup('NuGet Installing Packages', async () => {
                    const installQueue: Promise<void>[] = [];
                    selected.forEach(manager => installQueue.push(manager.nugetManager.installPackages(packages)));
                    await Promise.all(installQueue);
                });
            }
        }

        vscode.window.showInformationMessage('NuGet Package(s) installed');
        this.installedPackagesView.refresh();
    }
}

export function deactivate() {
    vscode.commands.executeCommand('setContext', 'inDotnetProject', false);
}

export const extensionManager = new ExtensionManager();
