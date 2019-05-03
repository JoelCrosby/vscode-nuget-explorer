import { PackageResolver } from "../resolver/PackageResolver";
import { NugetManager } from "./NugetManager";
import { QuickPickItem } from "vscode";
import { NugetPackage } from '../models/NugetPackage';

export class WorkspaceManager implements QuickPickItem {

    get label(): string { return this.name; }

    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;

    packages: NugetPackage[] = [];

    constructor(
        public name: string,
        public resolver: PackageResolver,
        public nugetManager: NugetManager) { }

    async refresh() {
        this.packages = await this.resolver.getPackages();
    }

}
