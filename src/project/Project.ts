export interface Project {
    Project?: ProjectTree;
}

export interface ProjectTree {
    ItemGroup?: any[];
    PropertyGroup?: any;
    Sdk?: string;
    Target?: any[];
}
