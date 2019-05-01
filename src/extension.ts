import * as vscode from 'vscode';
import { InstalledPackages } from './views/InstalledPackages';
import { NugetManager } from './manager/NugetManager';
import { DotnetManager } from './manager/DotnetManager';

export function activate(context: vscode.ExtensionContext) {

  vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

  if (!vscode.workspace.rootPath) {
    vscode.window.showInformationMessage('No dependency in empty workspace');
    return Promise.resolve([]);
  }

  const dotnetManager = new DotnetManager(vscode.window.createOutputChannel('NuGet'));
  const installedPackages = new InstalledPackages(vscode.workspace.rootPath);

  const nugetManager = new NugetManager(dotnetManager, installedPackages);

  vscode.window.registerTreeDataProvider('nuget-installed', installedPackages);

  vscode.commands.registerCommand('nuget-explorer.refresh', () => installedPackages.refresh());
  vscode.commands.registerCommand('nuget-explorer.install', () => nugetManager.install());
  vscode.commands.registerCommand('nuget-explorer.uninstall', (item) => nugetManager.uninstall(item));

}

export function deactivate() { }


