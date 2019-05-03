import Axios from 'axios';

import { showMessage } from '../utils';
import { SearchResult } from './SearchResult';

class NugetApiService {

    async search(query: string): Promise<SearchResult | undefined> {
        try {
            const res = await Axios.get<SearchResult>(
                `https://api-v2v3search-0.nuget.org/query?q=${query}&prerelease=false`);
            return res.data;
        } catch (error) {
            showMessage('Unable to reach NuGet api');
            return;
        }
    }
}

export const nugetApiService = new NugetApiService();
