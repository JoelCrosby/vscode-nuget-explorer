import * as vscode from 'vscode';

import { NugetPackageTreeItem, TreeItemType } from './TreeItems/NugetPackageTreeItem';
import { WorkspaceManager } from '../manager/WorkspaceManager';

export class UpdatePackagesView implements vscode.TreeDataProvider<NugetPackageTreeItem> {

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

        if (element.manager.packagesWithUpdates.length < 1) {
            return [
                new NugetPackageTreeItem(
                    'All Packages Up to Date',
                    '',
                    vscode.TreeItemCollapsibleState.None,
                    TreeItemType.empty,
                    element.manager
                ),
            ];
        }

        return element.manager.packagesWithUpdates.map(item =>
            new NugetPackageTreeItem(
                item.name,
                item.version,
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.package,
                element.manager,
                item,
            )
        );
    }
}
