import * as vscode from 'vscode';

import { InstalledPackagesView } from './views/InstalledPackagesView';
import { NugetManager } from './manager/NugetManager';
import { DotnetManager } from './manager/DotnetManager';
import { PackageResolver } from './resolver/PackageResolver';
import { WorkspaceManager } from './manager/WorkspaceManager';
import { searchService } from './nuget/SearchService';
import { NugetPackageTreeItem } from './views/TreeItems/NugetPackageTreeItem';
import { showProgressPopup, showMessage } from './utils';
import { updateService } from './nuget/UpdateService';


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
            showMessage('No dependency in empty workspace');
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

        this.refresh()
            .then(() => {
                // Only show NuGet View Container if any workspace contains a valid project file
                if (this.workspaceManagers.filter(manager => manager.resolver.isValidWorkspace()).length) {
                    this.registerViewAndCommands();
                }
            });

    }

    registerViewAndCommands() {

        // Set context to enable activity bar view container.
        vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

        vscode.window.registerTreeDataProvider('nuget-installed', this.installedPackagesView);

        vscode.commands.registerCommand('nuget-explorer.refresh', () => this.refresh());
        vscode.commands.registerCommand('nuget-explorer.check-for-updates', (item: NugetPackageTreeItem) => this.checkForUpdates(item));
        vscode.commands.registerCommand('nuget-explorer.check-for-updates-all', () => this.checkForUpdatesAll());
        vscode.commands.registerCommand('nuget-explorer.install', (item: NugetPackageTreeItem) => this.managePackageInstall(item));
        vscode.commands.registerCommand('nuget-explorer.uninstall', (item: NugetPackageTreeItem) => this.managePackageUnInstall(item));

    }

    async refresh() {
        const refreshTasks: Promise<void>[] = [];
        this.workspaceManagers.forEach(manager => refreshTasks.push(manager.refresh()));
        await Promise.all(refreshTasks);
        this.installedPackagesView.refresh();
    }

    async checkForUpdates(item: NugetPackageTreeItem) {

        await showProgressPopup('NuGet checking for package updates', async () => {

            if (!item.nugetPackage) { return; }

            const result = await updateService.checkForUpdates(item.nugetPackage);

            if (result.length) {
                showMessage('NuGet package update available');
            } else {
                showMessage('NuGet package up to date');
            }

            this.installedPackagesView.refresh();
        });
    }

    async checkForUpdatesAll() {

        await showProgressPopup('NuGet checking for package updates', async () => {
            const updateTasks: Promise<string[]>[] = [];

            this.workspaceManagers.forEach(manager => {
                manager.packages.forEach(nugetPackage => {
                    updateTasks.push(updateService.checkForUpdates(nugetPackage));
                });
            });

            const results = await Promise.all(updateTasks);

            if (results.filter(result => result.length).length) {
                showMessage('NuGet package updates are available');
            } else {
                showMessage('NuGet All packages up to date');
            }

            this.installedPackagesView.refresh();
        });
    }

    async managePackageInstall(item?: NugetPackageTreeItem) {

        const packages = await searchService.search();

        if (!packages) { return; }

        if (item) {
            await showProgressPopup('NuGet Installing Packages', () => item.manager.nugetManager.installPackages(packages));
        } else if (this.workspaceManagers.length === 1) {
            await showProgressPopup('NuGet Installing Packages', () => this.workspaceManagers[0].nugetManager.installPackages(packages));
        } else {
            const selected = await vscode.window.showQuickPick<WorkspaceManager>(
                this.workspaceManagers, { canPickMany: true, placeHolder: 'Select Projects' });

            if (selected && selected.length) {
                await showProgressPopup('NuGet Installing Packages', async () => {
                    const installQueue: Promise<void>[] = [];
                    selected.forEach(manager => installQueue.push(manager.nugetManager.installPackages(packages)));
                    await Promise.all(installQueue);
                });
            }
        }

        showMessage('NuGet Package(s) installed');
        this.refresh();
    }

    async managePackageUnInstall(item: NugetPackageTreeItem) {
        showProgressPopup('NuGet Removing Package ' + item.label, async () => {
            await item.manager.nugetManager.uninstall(item);
            showMessage(`NuGet Package ${item.label} Removed`);
            this.refresh();
        });
    }
}

export function deactivate() {
    vscode.commands.executeCommand('setContext', 'inDotnetProject', false);
}

export const extensionManager = new ExtensionManager();
