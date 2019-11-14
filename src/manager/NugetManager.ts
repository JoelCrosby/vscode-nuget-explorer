import { DotnetManager } from './dotnetManager';
import { InstalledPackagesView } from '../views/installedPackagesView';
import { NugetPackage } from '../models/nugetPackage';

export class NugetManager {
  constructor(private dotnetManager: DotnetManager, private installedPackages: InstalledPackagesView) {}

  async installPackages(packageNames: string[]) {
    if (!packageNames || packageNames.length < 0) {
      return;
    }

    const packagesToInstall: Array<Promise<void>> = [];

    packageNames.forEach(option => packagesToInstall.push(this.dotnetManager.execute(['add', 'package', option])));

    try {
      await Promise.all(packagesToInstall);
    } catch (error) {
      console.error(error);
    }
  }

  async uninstall(nugetPackage: NugetPackage) {
    try {
      await this.dotnetManager.execute(['remove', 'package', nugetPackage.id]);
    } catch (error) {
      console.error(error);
    }
  }

  async update(nugetPackage: NugetPackage) {
    const version = nugetPackage.latestVersion();

    if (!version) {
      return;
    }
    try {
      await this.dotnetManager.execute(['add', 'package', nugetPackage.id, '-v', version]);
    } catch (error) {
      console.error(error);
    }
  }
}
