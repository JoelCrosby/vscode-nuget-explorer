import { NugetApiService } from './nuget-api-service';
import { NugetPackage } from '../models/nuget-package';

export class UpdateService {
  static async checkForUpdates(nugetPackage: NugetPackage): Promise<string[]> {
    const versions = await this.getVersions(nugetPackage.id);

    if (!versions || !nugetPackage.version) {
      return [];
    }

    nugetPackage.versions = versions;

    return this.getUpdates(nugetPackage);
  }

  private static getUpdates(nugetPackage: NugetPackage): string[] {
    const { versions } = nugetPackage;

    if (!versions) {
      return [];
    }

    const currentVersionIndex = versions.findIndex((version) => version === nugetPackage.version);

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

  private static async getVersions(packageId: string): Promise<string[]> {
    const results = await NugetApiService.getVersions(packageId);

    if (!results) {
      return [];
    }

    return results.versions || [];
  }
}
