import * as vscode from 'vscode';

import { ProjectManager } from '../../manager/project-manager';
import { packageIcon, projectIcon, packageUpdateIcon } from '../icons';
import { NugetPackage } from '../../models/nuget-package';

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

    this.tooltip = this.getTooltip();
    this.description = this.getDescription();
    this.iconPath = this.getIcon();
    this.contextValue = this.getContextValue();
  }

  get updateAvailable() {
    return this.nugetPackage && this.nugetPackage.latestVersion();
  }

  getTooltip(): string {
    if (this.nugetPackage && this.updateAvailable) {
      return `${this.label}-${this.version} (Update available -> ${this.nugetPackage.latestVersion()})`;
    }
    return `${this.label}-${this.version}`;
  }

  getDescription(): string {
    if (this.nugetPackage && this.nugetPackage.latestVersion()) {
      return `${this.version} -> ${this.nugetPackage.latestVersion()}`;
    }
    return this.version;
  }

  getIcon() {
    switch (this.type) {
      case TreeItemType.package:
        return this.updateAvailable ? packageUpdateIcon : packageIcon;
      case TreeItemType.workspace:
        return projectIcon;
      default:
        return;
    }
  }

  getContextValue() {
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
