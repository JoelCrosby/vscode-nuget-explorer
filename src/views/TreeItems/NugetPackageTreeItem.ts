import * as vscode from 'vscode';

import { WorkspaceManager } from '../../manager/WorkspaceManager';
import { packageIcon, projectIcon } from '../Icons';

export class NugetPackageTreeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        private version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type = TreeItemType.package,
        public readonly manager?: WorkspaceManager) {

        super(label, collapsibleState);
    }

    get tooltip(): string {
        return `${this.label}-${this.version}`;
    }

    get description(): string {
        return this.version;
    }

    iconPath = this.getIcon();

    contextValue = this.getContextValue();

    private getIcon() {
        switch (this.type) {
            case TreeItemType.package:
                return packageIcon;
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