import { ProjectTree } from '../models/Project';

export class PackageResolver {
  static resolve(project: ProjectTree): ProjectDependacy[] {
    if (!project.ItemGroup) {
      return [];
    }

    const packages: ProjectDependacy[] = [];

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

  private static getPackages(itemGroup: any): ProjectDependacy[] {
    const pakages: ProjectDependacy[] = [];

    if (itemGroup.hasOwnProperty('PackageReference')) {
      itemGroup.PackageReference.forEach((ref: any) => {
        pakages.push({
          name: ref.$.Include,
          version: ref.$.Version,
        });
      });
    }

    return pakages;
  }
}

export interface ProjectDependacy {
  name: string;
  version: string;
}
