import * as vscode from 'vscode';
import { nugetApiService } from './NuGetApiService';

class SearchService {

    async search(): Promise<string[] | undefined> {
        const query = await vscode.window.showInputBox(
            { prompt: 'Search the NuGet Gallery for Pacakages', placeHolder: 'Search for Pacakges' });

        if (!query) { return; }

        const results = await nugetApiService.search(query);

        if (!results) { return; }

        const options = results.data.map(result => result.id);

        const selectedOptions = await vscode.window.showQuickPick(options,
            { canPickMany: true, placeHolder: 'Select Packages' });

        return selectedOptions;
    }
}

export const searchService = new SearchService();