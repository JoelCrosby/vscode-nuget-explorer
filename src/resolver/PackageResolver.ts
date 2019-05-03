import * as path from 'path';
import * as fs from 'fs';

import { XMLParser } from '../parser/XMLParser';
import { DepResolver, ProjectDependacy } from './DepResolver';
import { showMessage } from '../utils';
import { ProjectParser } from '../parser/ProjectParser';

export class PackageResolver {

    public isValidWorkspace = () => this.resolveProjectFile();

    private parser: ProjectParser = new XMLParser();

    constructor(private workspaceRoot: string) { }

    async getPackages(): Promise<ProjectDependacy[]> {
        const projectFile = this.resolveProjectFile();
        const projectFilePath = path.join(this.workspaceRoot, projectFile);

        if (this.pathExists(projectFilePath)) {
            const items = this.getDepsInProjectFile(projectFilePath);
            return await items;
        } else {
            showMessage('Workspace has no .csproj project file');
            return [];
        }
    }

    private resolveProjectFile(): string {

        const files = fs.readdirSync(this.workspaceRoot);
        const projExpr = /([a-zA-Z0-9\s_\\.\-\(\):])+(.csproj)$/g;

        let projectFile = '';

        files.forEach(file => {
            if (file.match(projExpr)) {
                projectFile = file;
            }
        });

        return projectFile;
    }

    private async getDepsInProjectFile(projectFilePath: string): Promise<ProjectDependacy[]> {

        if (!this.pathExists(projectFilePath)) { return []; }

        const projectFileString = fs.readFileSync(projectFilePath).toString();
        const projectTree = await this.parser.parse(projectFileString);

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

