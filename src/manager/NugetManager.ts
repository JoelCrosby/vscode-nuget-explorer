import { DotnetManager } from './DotnetManager';
import { InstalledPackagesView } from '../views/InstalledPackagesView';
import { NugetPackage } from '../models/NugetPackage';

export class NugetManager {

    constructor(private dotnetManager: DotnetManager, private installedPackages: InstalledPackagesView) {

    }

    async installPackages(packageNames: string[]) {

        if (!packageNames || packageNames.length < 0) { return; }

        const packagesToInstall: Promise<void>[] = [];

        packageNames.forEach(option =>
            packagesToInstall.push(this.dotnetManager.execute(['add', 'package', option]))
        );

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

}
