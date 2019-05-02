import * as vscode from 'vscode';

import { PackageResolver } from "../resolver/PackageResolver";
import { NugetManager } from "./NugetManager";
import { QuickPickItem } from "vscode";
import { NugetPackage } from '../models/NugetPackage';

export class WorkspaceManager implements QuickPickItem {

    get name(): string { return this.workspaceFolder.name; }
    get label(): string { return this.workspaceFolder.name; }

    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;

    packages: NugetPackage[] = [];

    constructor(
        public workspaceFolder: vscode.WorkspaceFolder,
        public resolver: PackageResolver,
        public nugetManager: NugetManager) { }

    async refresh() {
        this.packages = await this.resolver.getPackages();
    }

}
