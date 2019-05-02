import { nugetApiService } from "./NuGetApiService";
import { NugetPackage } from "../models/NugetPackage";

class UpdateService {

    async checkForUpdates(nugetPackage: NugetPackage): Promise<string[] | undefined> {
        const versions = await this.getVersions(nugetPackage.id);

        if (!versions) { return; }

        const currentVersionIndex = versions.findIndex(version => version === nugetPackage.version);
        return versions.slice(currentVersionIndex);
    }

    async getVersions(packageId: string): Promise<string[] | undefined> {
        const results = await nugetApiService.search(packageId);

        if (!results) { return; }

        const packageMeta = results.data.find(result => result["@id"] === packageId);

        if (!packageMeta) { return; }

        return packageMeta.versions.map(version => version.version);
    }

}

export const updateService = new UpdateService();