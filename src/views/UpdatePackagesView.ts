import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { WorkspaceManager } from '../manager/WorkspaceManager';
import { NugetPackageTreeItem, TreeItemType } from './TreeItems/NugetPackageTreeItem';


export class UpdatePackagesView implements TreeDataProvider<NugetPackageTreeItem> {
  private _onDidChangeTreeData = new EventEmitter<NugetPackageTreeItem | undefined>();
  readonly onDidChangeTreeData? = this._onDidChangeTreeData.event;

  constructor(private managers: WorkspaceManager[]) {}

  getTreeItem(element: NugetPackageTreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: NugetPackageTreeItem | undefined): ProviderResult<NugetPackageTreeItem[]> {
    if (element && element.type === TreeItemType.workspace) {
      return this.getPackageTreeItems(element);
    } else {
      return this.managers.map(manager => {
        return new NugetPackageTreeItem(
          manager.name,
          '',
          TreeItemCollapsibleState.Expanded,
          TreeItemType.workspace,
          manager
        );
      });
    }
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  private getPackageTreeItems({ manager }: NugetPackageTreeItem): ProviderResult<NugetPackageTreeItem[]> {
    if (!manager) {
      return [];
    }

    if (manager.packagesWithUpdates.length < 1) {
      return [
        new NugetPackageTreeItem(
          'All Packages Up to Date',
          '',
          TreeItemCollapsibleState.None,
          TreeItemType.empty,
          manager
        ),
      ];
    }

    return manager.packagesWithUpdates.map(
      item =>
        new NugetPackageTreeItem(
          item.name,
          item.version,
          TreeItemCollapsibleState.None,
          TreeItemType.package,
          manager,
          item
        )
    );
  }
}
