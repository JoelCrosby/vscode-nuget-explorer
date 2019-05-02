import * as xml2js from 'xml2js';

import { ProjectTree } from './types/Project';

export class ProjectParser {

    private parser: xml2js.Parser = new xml2js.Parser();

    constructor(private xml: string) { }

    parse(): Promise<ProjectTree | undefined> {

        return new Promise((resolve, reject) => {
            this.parser.parseString(this.xml, (err: Error, result: any) => {
                if (err) { reject(err); }
                if (result.hasOwnProperty('Project')) {
                    resolve(result.Project);
                } else {
                    reject('Failed to parse project file: ' + err.message);
                }
            });
        });
    }
}
