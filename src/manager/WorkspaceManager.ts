import * as vscode from 'vscode';

import { PackageResolver } from "../resolver/PackageResolver";
import { NugetManager } from "./NugetManager";
import { QuickPickItem } from "vscode";

export class WorkspaceManager implements QuickPickItem {

    get name(): string { return this.workspaceFolder.name; }
    get label(): string { return this.workspaceFolder.name; }

    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;

    constructor(
        public workspaceFolder: vscode.WorkspaceFolder,
        public resolver: PackageResolver,
        public nugetManager: NugetManager) {


    }

}