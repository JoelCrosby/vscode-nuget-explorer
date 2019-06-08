import { nugetApiService } from './NuGetApiService';
import { NugetPackage } from '../models/NugetPackage';

class UpdateService {

    async checkForUpdates(nugetPackage: NugetPackage): Promise<string[]> {

        const versions = await this.getVersions(nugetPackage.id);

        if (!versions || !nugetPackage.version) { return []; }

        nugetPackage.versions = versions;

        return this.getUpdates(nugetPackage);
    }

    private getUpdates(nugetPackage: NugetPackage) {
        const { versions } = nugetPackage;

        if (!versions) { return []; }

        const currentVersionIndex = versions.findIndex(version => version === nugetPackage.version);

        const updates: string[] = [];

        if (currentVersionIndex === -1) {
            return [];
        }

        if (currentVersionIndex < versions.length - 1) {
            updates.push(...versions.slice(currentVersionIndex));
        }

        if (updates && updates.length) {
            nugetPackage.updates = updates;
        }

        return updates;
    }

    private async getVersions(packageId: string): Promise<string[]> {

        const results = await nugetApiService.search(packageId);

        if (!results) { return []; }

        const packageMeta = results.data.find(result => result.id === packageId);

        if (!packageMeta) { return []; }

        return packageMeta.versions.map(version => version.version);
    }

}

export const updateService = new UpdateService();
