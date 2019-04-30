import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class NugetProvider implements vscode.TreeDataProvider<NugetPackage> {
  onDidChangeTreeData?: vscode.Event<NugetPackage | null | undefined> | undefined;

  constructor(private workspaceRoot: string) { }

  getTreeItem(element: NugetPackage): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return new vscode.TreeItem('test', vscode.TreeItemCollapsibleState.None);
  }

  getChildren(element?: NugetPackage | undefined): vscode.ProviderResult<NugetPackage[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
  }

  private getDepsInPackageJson(packageJsonPath: string): NugetPackage[] {

    if (this.pathExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const toDep = (moduleName: string, version: string): NugetPackage => {
        if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
          return new NugetPackage(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
        } else {
          return new NugetPackage(moduleName, version, vscode.TreeItemCollapsibleState.None, {
            command: 'extension.openPackageOnNpm',
            title: '',
            arguments: [moduleName],
          });
        }
      };

      const deps = packageJson.dependencies ? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep])) : [];
      const devDeps = packageJson.devDependencies ? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep])) : [];
      return deps.concat(devDeps);
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {

    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }

  refresh() { }
}

export class NugetPackage extends vscode.TreeItem {
  constructor(public readonly label: string, private version: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    return this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg'),
  };

  contextValue = 'dependency';
}
