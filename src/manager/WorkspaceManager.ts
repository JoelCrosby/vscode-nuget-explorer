import { PackageResolver } from '../resolver/PackageResolver';
import { NugetManager } from './NugetManager';
import { QuickPickItem } from 'vscode';
import { NugetPackage } from '../models/NugetPackage';

export class WorkspaceManager implements QuickPickItem {

    get label(): string { return this.name; }

    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;

    packages: NugetPackage[] = [];
    packagesWithUpdates: NugetPackage[] = [];

    constructor(
        public name: string,
        public resolver: PackageResolver,
        public nugetManager: NugetManager) { }

    async refresh() {
        const deps = await this.resolver.getPackages();
        this.packages = deps.map(dep => new NugetPackage(
            dep.name,
            dep.name,
            dep.version,
            this
        ));
        this.refreshUpdates();
    }

    refreshUpdates() {
        this.packagesWithUpdates = this.packages.filter(dep => dep.latestVersion())
    }

}
