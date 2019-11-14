import { workspace } from 'vscode';
import { ProjectReference } from './ProjectReference';

export class ProjectResolver {

  constructor(readonly projectFilePath: string) {}

  static async getProjectsInWorkspace(): Promise<ProjectReference[]> {
    const projectFiles = await this.resolveProjectFiles();
    return projectFiles.map(file => new ProjectReference(file));
  }

  private static async resolveProjectFiles(): Promise<string[]> {
    const files = await workspace.findFiles('**/*.csproj', '**/node_modules/**');
    return files.map(file => file.fsPath);
  }
}
