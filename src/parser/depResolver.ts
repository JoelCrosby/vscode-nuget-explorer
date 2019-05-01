import { ProjectTree } from "./types/Project";
import * as vscode from 'vscode';
import { NugetPackage } from "../views/TreeItems/NugetPackage";

export class DepResolver {

    static resolve(project: ProjectTree) {
        if (!project.ItemGroup) { return []; }

        const pakages: NugetPackage[] = [];

        project.ItemGroup.forEach(itemGroup => {
            if (itemGroup.hasOwnProperty('PackageReference')) {
                itemGroup.PackageReference.forEach((ref: any) => {
                    pakages.push(
                        new NugetPackage(
                            ref.Include,
                            ref.Version,
                            vscode.TreeItemCollapsibleState.None
                        )
                    );
                });
            }
        });

        return pakages;
    }
}