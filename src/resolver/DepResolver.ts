import { ProjectTree } from "../parser/models/Project";
import { NugetPackage } from "../models/NugetPackage";

export class DepResolver {

    static resolve(project: ProjectTree): NugetPackage[] {
        if (!project.ItemGroup) { return []; }

        const packages: NugetPackage[] = [];

        if (Array.isArray(project.ItemGroup)) {
            project.ItemGroup.forEach(itemGroup => {
                packages.push(...this.getPackages(itemGroup));
            });
        } else if (typeof project.ItemGroup === 'object') {
            packages.push(...this.getPackages(project.ItemGroup));
        } else {
            return packages;
        }

        return packages;
    }

    private static getPackages(itemGroup: any): NugetPackage[] {

        const pakages: NugetPackage[] = [];

        if (itemGroup.hasOwnProperty('PackageReference')) {
            itemGroup.PackageReference.forEach((ref: any) => {
                pakages.push(new NugetPackage(
                    ref.$.Include,
                    ref.$.Include,
                    ref.$.Version
                ));
            });
        }

        return pakages;
    }
}
