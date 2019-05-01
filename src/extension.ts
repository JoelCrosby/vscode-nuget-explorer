import * as vscode from 'vscode';
import { NugetProvider } from './views/NugetExplorer';

export function activate(context: vscode.ExtensionContext) {

  vscode.commands.executeCommand('setContext', 'inDotnetProject', true);

  if (!vscode.workspace.rootPath) {
    vscode.window.showInformationMessage('No dependency in empty workspace');
    return Promise.resolve([]);
  }

  const nugetProvider = new NugetProvider(vscode.workspace.rootPath);

  vscode.window.registerTreeDataProvider('nuget-installed', nugetProvider);
  vscode.commands.registerCommand('nuget-explorer.refresh', () => nugetProvider.refresh());

}

export function deactivate() { }


