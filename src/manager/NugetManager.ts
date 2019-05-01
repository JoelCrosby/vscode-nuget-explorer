import * as vscode from 'vscode';
import Axios from 'axios';

import { SearchResult } from './NugetApi/SearchResult';
import { DotnetManager } from './DotnetManager';
import { InstalledPackagesView } from '../views/InstalledPackagesView';
import { NugetPackageTreeItem } from '../views/TreeItems/NugetPackageTreeItem';

export class NugetManager {

    constructor(private dotnetManager: DotnetManager, private installedPackages: InstalledPackagesView) {

    }

    async install() {
        const query = await vscode.window.showInputBox(
            { prompt: 'Search the NuGet Gallery for Pacakages', placeHolder: 'Search for Pacakges' });

        if (!query) { return; }

        const results = await this.search(query);

        if (!results) { return; }

        const options = results.data.map(result => result.id);

        const selectedOptions = await vscode.window.showQuickPick(options,
            { canPickMany: true, placeHolder: 'Select Packages' });

        if (!selectedOptions || selectedOptions.length < 0) { return; }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "NuGet Installing Packages",
            cancellable: false
        }, async () => {

            const packagesToInstall: Promise<void>[] = [];

            selectedOptions.forEach(async option => {
                packagesToInstall.push(this.dotnetManager.execute(['add', 'package', option]));
            });

            await Promise.all(packagesToInstall);

        });

        vscode.window.showInformationMessage('NuGet Package(s) installed');

        this.installedPackages.refresh();
    }

    async uninstall(nugetPackage: NugetPackageTreeItem) {

        if (!nugetPackage) { return; }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "NuGet Removing Package " + nugetPackage.label,
            cancellable: false
        }, async () => {

            await this.dotnetManager.execute(['remove', 'package', nugetPackage.label]);

            vscode.window.showInformationMessage(`NuGet Package ${nugetPackage.label} Removed`);

            this.installedPackages.refresh();
        });
    }

    async search(query: string): Promise<SearchResult | undefined> {
        try {
            const res = await Axios.get<SearchResult>(
                `https://api-v2v3search-0.nuget.org/query?q=${query}&prerelease=false`);
            return res.data;
        } catch (error) {
            vscode.window.showInformationMessage('Unable to reach NuGet api');
            return;
        }
    }

}