import { ProjectTree } from './models/Project';

export interface ProjectParser {
    parse(input: string): Promise<ProjectTree | undefined>;
}
