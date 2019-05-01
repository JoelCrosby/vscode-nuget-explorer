import * as vscode from 'vscode';
import * as process from 'process';

import { spawn } from 'child_process';

export class DotnetManager {

    constructor(private output: vscode.OutputChannel) { }

    async execute(commands: string[], terminal: string = 'NuGet'): Promise<void> {
        return new Promise((resolve, reject) => {

            if (!vscode.workspace.rootPath) { return; }

            const returnWd = process.cwd();
            process.chdir(vscode.workspace.rootPath);

            const dotnet = spawn('dotnet', commands);

            dotnet.stdout.setEncoding('utf8');

            dotnet.stdout.on('data', (chunk) => {
                this.output.appendLine(chunk);
            });

            dotnet.stdout.on('error', (err: Error) => {
                this.output.appendLine(err.message);
                process.chdir(returnWd);
                reject();
            });

            dotnet.on('close', (code) => {
                this.output.appendLine(`child process exited with code ${code}`);
                process.chdir(returnWd);
                resolve();
            });
        });
    }

}