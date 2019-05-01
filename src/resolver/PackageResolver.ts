import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { NugetPackage } from '../models/NugetPackage';
import { ProjectParser } from '../parser/ProjectParser';
import { DepResolver } from './DepResolver';

export class PackageResolver {

    constructor(private workspaceRoot: string) { }

    getPackages(): NugetPackage[] {
        const projectFile = this.resolveProjectFile(this.workspaceRoot);
        const projectFilePath = path.join(this.workspaceRoot, projectFile);

        if (this.pathExists(projectFilePath)) {
            const items = this.getDepsInProjectFile(projectFilePath);
            return items;
        } else {
            vscode.window.showInformationMessage('Workspace has no .csproj project file');
            return [];
        }
    }

    private resolveProjectFile(root: string): string {

        const files = fs.readdirSync(root);
        const projExpr = /([a-zA-Z0-9\s_\\.\-\(\):])+(.csproj)$/g;

        let projectFile = '';

        files.forEach(file => {
            if (file.match(projExpr)) {
                projectFile = file;
            }
        });

        return projectFile;
    }

    private getDepsInProjectFile(projectFilePath: string): NugetPackage[] {

        if (!this.pathExists(projectFilePath)) { return []; }

        const projectFileString = fs.readFileSync(projectFilePath).toString();

        const parser = new ProjectParser(projectFileString, []);
        const projectTree = parser.parse();

        if (!projectTree) { return []; }

        const items = DepResolver.resolve(projectTree);

        return items;
    }

    private pathExists(path: string | undefined): boolean {

        if (!path) { return false; }
        try {
            fs.accessSync(path);
        } catch (err) {
            return false;
        }
        return true;
    }

}

