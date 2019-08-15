import Axios from 'axios';

import { SearchResult } from '../models/SearchResult';

export class NugetApiService {

    static baseUrl = 'https://api-v2v3search-0.nuget.org/query';

    static async search(query: string): Promise<SearchResult | undefined> {

        try {
            const res = await Axios.get<SearchResult>
                (`${this.baseUrl}?q=${query}&prerelease=false`);

            return res.data;

        } catch (error) {
            throw Error('Unable to reach NuGet Service.');
        }
    }
}

