import * as vscode from 'vscode';

import { DotnetManager } from './manager/DotnetManager';
import { NugetManager } from './manager/NugetManager';
import { ProjectManager } from './manager/ProjectManager';
import { NugetExplorer } from './NugetExplorer';
import { ProjectResolver } from './resolver/ProjectResolver';
import { InstalledPackagesView } from './views/InstalledPackagesView';
import { NugetPackageTreeItem } from './views/TreeItems/NugetPackageTreeItem';
import { UpdatePackagesView } from './views/UpdatePackagesView';


export function activate(context: vscode.ExtensionContext) {
  extensionManager.start();
}

export class ExtensionManager {
  outputChannel = vscode.window.createOutputChannel('NuGet');

  workspaceManagers: ProjectManager[] = [];

  installedPackagesView = new InstalledPackagesView(this.workspaceManagers);
  updatePackagesView = new UpdatePackagesView(this.workspaceManagers);

  nugetExplorer = new NugetExplorer(this.workspaceManagers, this.installedPackagesView, this.updatePackagesView);

  async start() {
    const projects = await ProjectResolver.getProjectsInWorkspace();

    projects.forEach(project => {
      const nugetManager = new NugetManager(new DotnetManager(this.outputChannel, project.rootFolder), this.installedPackagesView);
      this.workspaceManagers.push(new ProjectManager(project.name, project, nugetManager));
    });

    await this.nugetExplorer.refresh();

    // Only show NuGet View Container if any workspace contains a valid project file
    if (this.workspaceManagers.length) {
      this.registerViewAndCommands();
      this.nugetExplorer.checkForUpdatesAll(true);
    }
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
      if (item && item.nugetPackage) {
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
