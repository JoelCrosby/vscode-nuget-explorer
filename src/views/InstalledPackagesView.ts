import * as vscode from 'vscode';

import { NugetPackageTreeItem, TreeItemType } from './TreeItems/NugetPackageTreeItem';
import { WorkspaceManager } from '../manager/WorkspaceManager';

export class InstalledPackagesView implements vscode.TreeDataProvider<NugetPackageTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<NugetPackageTreeItem | undefined> = new vscode.EventEmitter<NugetPackageTreeItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<NugetPackageTreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    constructor(private managers: WorkspaceManager[]) { }

    getTreeItem(element: NugetPackageTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: NugetPackageTreeItem | undefined): vscode.ProviderResult<NugetPackageTreeItem[]> {
        if (element && element.type === TreeItemType.workspace) {
            return this.getPackageTreeItems(element);
        } else {

            return this.managers.map(manager => {
                return new NugetPackageTreeItem(
                    manager.name,
                    '',
                    vscode.TreeItemCollapsibleState.Expanded,
                    TreeItemType.workspace,
                    manager
                );
            });
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    private getPackageTreeItems(element: NugetPackageTreeItem): vscode.ProviderResult<NugetPackageTreeItem[]> {
        if (!element.manager) { return []; }

        return element.manager.resolver.getPackages()

            .then((packages) => {

                if (packages.length < 1) {
                    return [
                        new NugetPackageTreeItem(
                            'No NuGet dependancies in this workspace',
                            '',
                            vscode.TreeItemCollapsibleState.None,
                            TreeItemType.empty
                        ),
                    ];
                }

                return packages.map(item =>
                    new NugetPackageTreeItem(
                        item.name,
                        item.version,
                        vscode.TreeItemCollapsibleState.None,
                        TreeItemType.package,
                        element.manager
                    ));
            });
    }
}