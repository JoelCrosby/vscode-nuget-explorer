import Axios from 'axios';

import { SearchResult } from '../models/SearchResult';
import { VersionsResponse } from '../models/VersionsRespose';

export class NugetApiService {

    static baseUri = 'https://api-v2v3search-0.nuget.org/query';
    static versionsUri = 'https://api.nuget.org/v3-flatcontainer';

    static async search(query: string): Promise<SearchResult | undefined> {

        try {
            const res = await Axios.get<SearchResult>
                (`${this.baseUri}?q=${query}&prerelease=false`);

            return res.data;

        } catch (error) {
            throw Error('Unable to reach NuGet Service.');
        }
    }

    static async getVersions(packageId: string): Promise<VersionsResponse | undefined> {

        try {
            const res = await Axios.get<VersionsResponse>
                (`${this.versionsUri}/${packageId}/index.json`);

            return res.data;

        } catch (error) {
            throw Error('Unable to reach NuGet Service.');
        }
    }
}

