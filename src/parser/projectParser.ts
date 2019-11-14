import { ProjectTree } from '../models/project';

export interface ProjectParser {
  parse(input: string): Promise<ProjectTree | undefined>;
}
