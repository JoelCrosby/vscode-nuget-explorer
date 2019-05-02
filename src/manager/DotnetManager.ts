import * as vscode from 'vscode';

import { spawn } from 'child_process';
import { PackageResolver } from '../resolver/PackageResolver';

export class DotnetManager {

    constructor(private output: vscode.OutputChannel, private workspaceFolder: vscode.WorkspaceFolder) { }

    async execute(commands: string[]): Promise<void> {
        return new Promise((resolve, reject) => {

            if (!this.workspaceFolder.uri.fsPath) { return reject(); }

            const dotnet = spawn('dotnet', commands, { cwd: this.workspaceFolder.uri.fsPath });

            dotnet.stdout.setEncoding('utf8');

            dotnet.stdout.on('data', (chunk) => {
                this.output.append(chunk);
            });

            dotnet.stdout.on('error', (err: Error) => {
                this.output.appendLine(err.message);
                reject();
            });

            dotnet.on('close', (code) => {
                resolve();
            });
        });
    }

}