export class NugetPackage {

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly version: string) { }

    updates?: string[];

    latestVersion(): string | undefined {
        if (!this.updates) { return; }
        return this.updates[this.updates.length - 1];
    }
}
