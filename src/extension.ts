import * as vscode from 'vscode';
import { NugetProvider } from './NugetExplorer';

export function activate(context: vscode.ExtensionContext) {

  if (!vscode.workspace.rootPath) {
    vscode.window.showInformationMessage('No dependency in empty workspace');
    return Promise.resolve([]);
  }

  const nugetProvider = new NugetProvider(vscode.workspace.rootPath);

  vscode.window.registerTreeDataProvider('nuget-installed', nugetProvider);
  vscode.commands.registerCommand('nuget-explorer.refresh', () => nugetProvider.refresh());

}

export function deactivate() { }
