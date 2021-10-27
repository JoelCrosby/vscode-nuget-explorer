import { ProjectManager } from '../manager/project-manager';

export class NugetPackage {
  get label() {
    return this.name;
  }

  get detail() {
    return this.projectName;
  }

  updates?: string[];
  projectName?: string;
  versions?: string[];

  constructor(readonly id: string, readonly name: string, readonly version: string, readonly manager: ProjectManager) {}

  latestVersion(): string | undefined {
    if (!this.updates) {
      return;
    }
    return this.updates[this.updates.length - 1];
  }
}
