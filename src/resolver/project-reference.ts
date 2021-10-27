import * as fs from 'fs';
import * as path from 'path';

import { ProjectTree } from '../models/project';
import { ProjectParser } from '../parser/project-parser';
import { showErrorMessage } from '../utils/host';
import { ProjectDependacy } from '../models/project-dependancy';

export class ProjectReference {
  readonly rootFolder: string;
  readonly name: string;

  private parser = new ProjectParser();

  constructor(readonly projectFilePath: string) {
    this.rootFolder = path.dirname(projectFilePath);
    this.name = path.basename(projectFilePath);
  }

  async getProjectDependacies(): Promise<ProjectDependacy[]> {
    if (this.projectFilePath && this.pathExists(this.projectFilePath)) {
      return this.getDepsInProjectFile(this.projectFilePath);
    } else {
      showErrorMessage('Workspace has no .csproj project file');
      return [];
    }
  }

  private async getDepsInProjectFile(projectFilePath: string): Promise<ProjectDependacy[]> {
    if (!this.pathExists(projectFilePath)) {
      return [];
    }

    const projectFileString = fs.readFileSync(projectFilePath).toString();
    const projectTree = await this.parser.parse(projectFileString);

    if (!projectTree) {
      return [];
    }

    const items = this.resolve(projectTree);

    return items;
  }

  private pathExists(path: string | undefined): boolean {
    if (!path) {
      return false;
    }
    try {
      fs.accessSync(path);
    } catch (err) {
      return false;
    }
    return true;
  }

  private resolve(project: ProjectTree): ProjectDependacy[] {
    if (!project.ItemGroup) {
      return [];
    }

    const packages: ProjectDependacy[] = [];

    if (Array.isArray(project.ItemGroup)) {
      project.ItemGroup.forEach((itemGroup) => {
        packages.push(...this.getPackages(itemGroup));
      });
    } else if (typeof project.ItemGroup === 'object') {
      packages.push(...this.getPackages(project.ItemGroup));
    } else {
      return packages;
    }

    return packages;
  }

  private getPackages(itemGroup: any): ProjectDependacy[] {
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
