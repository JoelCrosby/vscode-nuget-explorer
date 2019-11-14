import { ProjectReference } from '../resolver/projectReference';
import { NugetManager } from './nugetManager';
import { QuickPickItem } from 'vscode';
import { NugetPackage } from '../models/nugetPackage';

export class ProjectManager implements QuickPickItem {

  get label(): string {
    return this.name;
  }

  get hasUpdates(): boolean {
    return !!this.packagesWithUpdates.length;
  }

  description?: string;
  detail?: string;
  picked?: boolean;
  alwaysShow?: boolean;

  packages: NugetPackage[] = [];
  packagesWithUpdates: NugetPackage[] = [];

  constructor(readonly name: string, readonly project: ProjectReference, readonly nugetManager: NugetManager) {}

  async refresh() {
    const deps = await this.project.getProjectDependacies();
    this.packages = deps.map(dep => new NugetPackage(dep.name, dep.name, dep.version, this));
    this.refreshUpdates();
  }

  refreshUpdates() {
    this.packagesWithUpdates = this.packages.filter(dep => dep.latestVersion());
  }
}
