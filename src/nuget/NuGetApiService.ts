import Axios from 'axios';

import { SearchResult } from './SearchResult';

class NugetApiService {

    async search(query: string): Promise<SearchResult | undefined> {

        try {
            const res = await Axios.get<SearchResult>(
                `https://api-v2v3search-0.nuget.org/query?q=${query}&prerelease=false`);

            return res.data;

        } catch (error) {
            throw Error('Unable to reach NuGet Service.');
        }
    }
}

export const nugetApiService = new NugetApiService();
