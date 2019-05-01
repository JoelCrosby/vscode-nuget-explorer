import * as vscode from 'vscode';

import { NugetPackageTreeItem } from './TreeItems/NugetPackageTreeItem';
import { PackageResolver } from '../resolver/PackageResolver';

export class InstalledPackages implements vscode.TreeDataProvider<NugetPackageTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<NugetPackageTreeItem | undefined> = new vscode.EventEmitter<NugetPackageTreeItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<NugetPackageTreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    constructor(private packageResolver: PackageResolver) { }

    getTreeItem(element: NugetPackageTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: NugetPackageTreeItem | undefined): vscode.ProviderResult<NugetPackageTreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return this.packageResolver.getPackages().then((packages) => {
                return packages.map(item =>
                    new NugetPackageTreeItem(
                        item.name,
                        item.version,
                        vscode.TreeItemCollapsibleState.None
                    )
                );
            });
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
