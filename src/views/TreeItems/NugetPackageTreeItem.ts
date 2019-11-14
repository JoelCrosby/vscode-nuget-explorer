import * as vscode from 'vscode';

import { ProjectManager } from '../../manager/ProjectManager';
import { packageIcon, projectIcon, packageUpdateIcon } from '../Icons';
import { NugetPackage } from '../../models/NugetPackage';

export class NugetPackageTreeItem extends vscode.TreeItem {
  constructor(
    readonly label: string,
    readonly version: string,
    readonly collapsibleState: vscode.TreeItemCollapsibleState,
    readonly type = TreeItemType.package,
    readonly manager: ProjectManager,
    readonly nugetPackage?: NugetPackage
  ) {
    super(label, collapsibleState);
  }

  get updateAvailable() {
    return this.nugetPackage && this.nugetPackage.latestVersion();
  }

  get tooltip(): string {
    if (this.nugetPackage && this.updateAvailable) {
      return `${this.label}-${this.version} (Update available -> ${this.nugetPackage.latestVersion()})`;
    }
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    if (this.nugetPackage && this.nugetPackage.latestVersion()) {
      return `${this.version} -> ${this.nugetPackage.latestVersion()}`;
    }
    return this.version;
  }

  iconPath = this.getIcon();

  contextValue = this.getContextValue();

  private getIcon() {
    switch (this.type) {
      case TreeItemType.package:
        return this.updateAvailable ? packageUpdateIcon : packageIcon;
      case TreeItemType.workspace:
        return projectIcon;
      default:
        return;
    }
  }

  private getContextValue() {
    switch (this.type) {
      case TreeItemType.package:
        return 'package';
      case TreeItemType.workspace:
        return 'workspace';
      default:
        return 'default';
    }
  }
}

export enum TreeItemType {
  package = 0,
  workspace = 1,
  empty = 2,
}
