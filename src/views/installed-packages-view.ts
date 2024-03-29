import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { NugetPackageTreeItem, TreeItemType } from './treeItems/nuget-package-tree-item';
import { ProjectManager } from '../manager/project-manager';

export class InstalledPackagesView implements TreeDataProvider<NugetPackageTreeItem> {
  private _onDidChangeTreeData = new EventEmitter<NugetPackageTreeItem | undefined>();
  readonly onDidChangeTreeData? = this._onDidChangeTreeData.event;

  constructor(private managers: ProjectManager[]) {}

  getTreeItem(element: NugetPackageTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: NugetPackageTreeItem | undefined): ProviderResult<NugetPackageTreeItem[]> {
    if (element && element.type === TreeItemType.workspace) {
      return this.getPackageTreeItems(element);
    } else {
      return this.managers.map((manager) => {
        return new NugetPackageTreeItem(manager.name, '', TreeItemCollapsibleState.Expanded, TreeItemType.workspace, manager);
      });
    }
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  private getPackageTreeItems({ manager }: NugetPackageTreeItem): ProviderResult<NugetPackageTreeItem[]> {
    if (!manager) {
      return [];
    }

    if (manager.packages.length < 1) {
      return [
        new NugetPackageTreeItem('No NuGet dependancies in this workspace', '', TreeItemCollapsibleState.None, TreeItemType.empty, manager),
      ];
    }

    return manager.packages.map(
      (item) => new NugetPackageTreeItem(item.name, item.version, TreeItemCollapsibleState.None, TreeItemType.package, manager, item)
    );
  }
}
