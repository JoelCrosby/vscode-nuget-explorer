import * as vscode from 'vscode';
import * as path from 'path';

export class NugetPackage extends vscode.TreeItem {

    constructor(public readonly label: string, private version: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}-${this.version}`;
    }

    get description(): string {
        return this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', '..', '..', 'media', 'light', 'dep.svg'),
        dark: path.join(__filename, '..', '..', '..', '..', 'media', 'dark', 'dep.svg'),
    };

    contextValue = 'nugetPackage';
}