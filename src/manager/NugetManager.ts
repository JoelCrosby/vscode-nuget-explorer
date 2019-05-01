import * as vscode from 'vscode';
import Axios from 'axios';

import { SearchResult } from './NugetApi/SearchResult';
import { DotnetManager } from './DotnetManager';
import { InstalledPackages } from '../views/InstalledPackages';

export class NugetManager {

    constructor(private dotnetManager: DotnetManager, private installedPackages: InstalledPackages) {

    }

    async install() {
        const query = await vscode.window.showInputBox(
            { placeHolder: 'Search Nuget Pacakges', prompt: 'Search Nuget Pacakges' });

        if (!query) { return; }

        const results = await this.search(query);

        if (!results) { return; }

        const options = results.data.map(result => result.id);

        const selectedOptions = await vscode.window.showQuickPick(options,
            { canPickMany: true, placeHolder: 'Select Packages' });

        if (!selectedOptions || selectedOptions.length < 0) { return; }

        const packagesToInstall: Promise<void>[] = [];

        selectedOptions.forEach(async option => {
            packagesToInstall.push(this.dotnetManager.execute(['add', 'package', option]));
        });

        const completedInstalls = await Promise.all(packagesToInstall);

        this.installedPackages.refresh();
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