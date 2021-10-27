import * as xml2js from 'xml2js';

import { ProjectTree } from '../models/Project';
import { ProjectParser } from './projectParser';

export class XMLParser implements ProjectParser {
  private parser: xml2js.Parser = new xml2js.Parser();

  parse(input: string): Promise<ProjectTree | undefined> {
    return new Promise((resolve, reject) => {
      this.parser.parseString(input, (err: Error, result: any) => {
        if (err) {
          reject(err);
        }
        if (result.hasOwnProperty('Project')) {
          resolve(result.Project);
        } else {
          reject('Failed to parse project file: ' + err.message);
        }
      });
    });
  }
}
