import { spawn } from 'child_process';

export class DotnetManager {
  constructor(private output: OutputChannel, private rootPath: string) {}

  async execute(commands: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.rootPath) {
        return reject();
      }

      const dotnet = spawn('dotnet', commands, { cwd: this.rootPath });

      dotnet.stdout.setEncoding('utf8');

      dotnet.stdout.on('data', chunk => {
        this.output.append(chunk);
      });

      dotnet.stdout.on('error', (err: Error) => {
        this.output.appendLine(err.message);
        reject(err.message);
      });

      dotnet.on('close', code => {
        resolve();
      });
    });
  }
}

export interface OutputChannel {
  append(value: string): void;
  appendLine(value: string): void;
}
