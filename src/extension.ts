import * as vscode from 'vscode';

import { DotnetManager } from './manager/DotnetManager';
import { NugetManager } from './manager/NugetManager';
import { WorkspaceManager } from './manager/WorkspaceManager';
import { NugetExplorer } from './NugetExplorer';
import { PackageResolver } from './resolver/PackageResolver';
import { showMessage } from './utils/host';
import { InstalledPackagesView } from './views/InstalledPackagesView';
import { NugetPackageTreeItem } from './views/TreeItems/NugetPackageTreeItem';
import { UpdatePackagesView } from './views/UpdatePackagesView';

export function activate(context: vscode.ExtensionContext) {
    extensionManager.start();
}

export class ExtensionManager {

    outputChannel = vscode.window.createOutputChannel('NuGet');

    workspaces = vscode.workspace.workspaceFolders;
    workspaceManagers: WorkspaceManager[] = [];

    installedPackagesView = new InstalledPackagesView(this.workspaceManagers);
    updatePackagesView = new UpdatePackagesView(this.workspaceManagers);

    nugetExplorer = new NugetExplorer(this.workspaceManagers, this.installedPackagesView, this.updatePackagesView);

    start() {

        if (!this.workspaces || this.workspaces.length < 1) {
            return showMessage('No dependency in empty workspace');
        }

        this.workspaces.forEach((worksapce: vscode.WorkspaceFolder) => {
            const resolver = new PackageResolver(worksapce.uri.fsPath);
            const nugetManager = new NugetManager(
                new DotnetManager(this.outputChannel, worksapce.uri.fsPath),
                this.installedPackagesView
            );

            this.workspaceManagers.push(new WorkspaceManager(worksapce.name, resolver, nugetManager));
        });

        this.nugetExplorer.refresh()
            .then(() => {
                // Only show NuGet View Container if any workspace contains a valid project file
                if (this.workspaceManagers.filter(manager => manager.resolver.isValidWorkspace()).length) {
                    this.registerViewAndCommands();
                }

                this.nugetExplorer.checkForUpdatesAll(true);
            });

    }

    private registerViewAndCommands() {

        // Set context to enable activity bar view container.
        vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

        vscode.window.registerTreeDataProvider('nuget-installed', this.installedPackagesView);
        vscode.window.registerTreeDataProvider('nuget-updates', this.updatePackagesView);

        vscode.commands.registerCommand('nuget-explorer.refresh', () => {
            this.nugetExplorer.refresh();
        });

        vscode.commands.registerCommand('nuget-explorer.check-for-updates', (item: NugetPackageTreeItem) => {
            if (item.nugetPackage) {
                this.nugetExplorer.checkForUpdates(item.nugetPackage);
            }
        });

        vscode.commands.registerCommand('nuget-explorer.check-for-updates-all', () => {
            this.nugetExplorer.checkForUpdatesAll();
        });

        vscode.commands.registerCommand('nuget-explorer.install', (item: NugetPackageTreeItem) => {
            this.nugetExplorer.managePackageInstall(item);
        });

        vscode.commands.registerCommand('nuget-explorer.uninstall', (item: NugetPackageTreeItem) => {
            this.nugetExplorer.managePackageUnInstall(item);
        });

        vscode.commands.registerCommand('nuget-explorer.update', (item: NugetPackageTreeItem) => {
            this.nugetExplorer.managePackageUpdate(item);
        });
    }

}

export function deactivate() {
    vscode.commands.executeCommand('setContext', 'inDotnetProject', false);
}

export const extensionManager = new ExtensionManager();
