import { WorkspaceManager } from "../manager/WorkspaceManager";

export class NugetPackage {

    get label() {
        return this.name;
    }

    get detail() {
        return this.projectName
    }

    updates?: string[];
    projectName?: string;


    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly version: string,
        public readonly manager: WorkspaceManager) { }


    latestVersion(): string | undefined {
        if (!this.updates) { return; }
        return this.updates[this.updates.length - 1];
    }
}
