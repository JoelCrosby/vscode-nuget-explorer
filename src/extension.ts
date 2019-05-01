import * as vscode from 'vscode';

import { InstalledPackagesView } from './views/InstalledPackagesView';
import { NugetManager } from './manager/NugetManager';
import { DotnetManager } from './manager/DotnetManager';
import { PackageResolver } from './resolver/PackageResolver';
import { WorkspaceManager } from './manager/WorkspaceManager';

export function activate(context: vscode.ExtensionContext) {

  vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

  const workspaces = vscode.workspace.workspaceFolders;

  if (!workspaces || workspaces.length < 1) {
    vscode.window.showInformationMessage('No dependency in empty workspace');
    return Promise.resolve([]);
  }

  const dotnetManager = new DotnetManager(vscode.window.createOutputChannel('NuGet'));
  const workspaceManagers: WorkspaceManager[] = [];
  const installedPackagesView = new InstalledPackagesView(workspaceManagers);

  workspaces.forEach((worksapce: vscode.WorkspaceFolder) => {
    const resolver = new PackageResolver(worksapce.uri.fsPath);
    const nugetManager = new NugetManager(dotnetManager, installedPackagesView);

    workspaceManagers.push(new WorkspaceManager(worksapce.name, resolver, nugetManager));
  });

  vscode.window.registerTreeDataProvider('nuget-installed', installedPackagesView);

  const selectedWorksapceManager = workspaceManagers[0];

  vscode.commands.registerCommand('nuget-explorer.refresh',
    () => installedPackagesView.refresh());

  vscode.commands.registerCommand('nuget-explorer.install',
    () => selectedWorksapceManager.nugetManager.install());

  vscode.commands.registerCommand('nuget-explorer.uninstall',
    (item) => selectedWorksapceManager.nugetManager.uninstall(item));

}

export function deactivate() {
  vscode.commands.executeCommand('setContext', 'inDotnetProject', false);
}


