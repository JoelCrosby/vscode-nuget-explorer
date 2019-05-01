import { PackageResolver } from "../resolver/PackageResolver";
import { NugetManager } from "./NugetManager";

export class WorkspaceManager {

    constructor(
        public name: string,
        public resolver: PackageResolver,
        public nugetManager: NugetManager) {


    }

}