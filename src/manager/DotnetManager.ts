import * as vscode from 'vscode';
import * as process from 'process';

import { spawn } from 'child_process';

export class DotnetManager {

    constructor(private output: vscode.OutputChannel) { }

    async execute(commands: string[]): Promise<void> {
        return new Promise((resolve, reject) => {

            if (!vscode.workspace.rootPath) { return reject(); }

            const returnWd = process.cwd();
            process.chdir(vscode.workspace.rootPath);

            const dotnet = spawn('dotnet', commands);

            dotnet.stdout.setEncoding('utf8');

            dotnet.stdout.on('data', (chunk) => {
                this.output.append(chunk);
            });

            dotnet.stdout.on('error', (err: Error) => {
                this.output.appendLine(err.message);
                process.chdir(returnWd);
                reject();
            });

            dotnet.on('close', (code) => {
                process.chdir(returnWd);
                resolve();
            });
        });
    }

}