import { WorkspaceManager } from "./manager/WorkspaceManager";
import { NugetPackageTreeItem } from "./views/TreeItems/NugetPackageTreeItem";
import { showProgressPopup, showMessage, showPickerView } from "./utils";
import { updateService } from "./nuget/UpdateService";
import { searchService } from "./nuget/SearchService";
import { NugetPackage } from "./models/NugetPackage";

export class NugetExplorer {

    constructor(private workspaceManagers: WorkspaceManager[], private view: NugetExplorerView) { }

    async refresh() {
        const refreshTasks: Promise<void>[] = [];
        this.workspaceManagers.forEach(manager => refreshTasks.push(manager.refresh()));
        await Promise.all(refreshTasks);
        this.view.refresh();
    }

    async checkForUpdates(item: NugetPackageTreeItem) {

        await showProgressPopup('NuGet checking for package updates', async () => {

            if (!item.nugetPackage) { return; }

            const result = await updateService.checkForUpdates(item.nugetPackage);

            if (result.length) {
                showMessage('NuGet package update available');
            } else {
                showMessage('NuGet package up to date');
            }

            this.view.refresh();
        });
    }

    async checkForUpdatesAll() {

        await showProgressPopup('NuGet checking for package updates', async () => {
            const updateTasks: Promise<string[]>[] = [];

            this.workspaceManagers.forEach(manager => {
                manager.packages.forEach(nugetPackage => {
                    updateTasks.push(updateService.checkForUpdates(nugetPackage));
                });
            });

            const results = await Promise.all(updateTasks);

            if (results.filter(result => result.length).length) {
                showMessage('NuGet package updates are available');
            } else {
                showMessage('NuGet All packages up to date');
            }

            this.view.refresh();
        });
    }

    async managePackageInstall(item?: NugetPackageTreeItem) {

        const packages = await searchService.search();

        if (!packages) { return; }

        if (item) {

            await showProgressPopup('NuGet Installing Packages', async () => {
                await item.manager.nugetManager.installPackages(packages);
            });

        } else if (this.workspaceManagers.length === 1) {

            await showProgressPopup('NuGet Installing Packages', async () => {
                await this.workspaceManagers[0].nugetManager.installPackages(packages);
            });

        } else {

            const selected = await this.promptSelectWorkspaces();

            if (selected && selected.length) {
                await showProgressPopup('NuGet Installing Packages', async () => {
                    const installQueue: Promise<void>[] = [];
                    selected.forEach(manager => installQueue.push(manager.nugetManager.installPackages(packages)));
                    await Promise.all(installQueue);
                });
            }
        }

        showMessage('NuGet Package(s) installed');
        this.refresh();
    }

    async managePackageUnInstall(item: NugetPackageTreeItem) {

        const unistallTasks: Promise<void>[] = [];
        let progressMessage = 'NuGet Removing Packages';
        let completionMessage = 'NuGet Packages Removed';

        if (!item) {
            const packages = await this.promptSelectPackages('Select packages to remove', 'Select Projects to remove packages from');
            packages.forEach(nugetPackage => unistallTasks.push(nugetPackage.manager.nugetManager.uninstall(nugetPackage)));
        } else {
            if (item.nugetPackage) {
                progressMessage = `NuGet Removing Package ${item.label}`;
                completionMessage = `NuGet Package ${item.label} Removed`;
                unistallTasks.push(item.manager.nugetManager.uninstall(item.nugetPackage));
            }
        }

        await showProgressPopup(progressMessage, async () => {
            await Promise.all(unistallTasks);
        });

        showMessage(completionMessage);
        this.refresh();
    }

    private async promptSelectPackages(prompt: string = 'Select Packages', workspacesPrompt = 'Select Projects'): Promise<NugetPackage[]> {
        if (this.workspaceManagers.length === 1) {
            const selected = await showPickerView<NugetPackage>(this.workspaceManagers[0].packages, true, prompt);
            return selected || [];
        }

        const selectedWorkspaces = await this.promptSelectWorkspaces(workspacesPrompt);
        const packagesToSelect: NugetPackage[] = [];


        selectedWorkspaces.forEach(workspace => {
            if (selectedWorkspaces.length > 1) {
                workspace.packages.forEach(item => item.projectName = workspace.name);
            }
            packagesToSelect.push(...workspace.packages);
        });

        const selected = await showPickerView<NugetPackage>(packagesToSelect, true, prompt);
        return selected || [];
    }

    private async promptSelectWorkspaces(prompt: string = 'Select Projects'): Promise<WorkspaceManager[]> {
        const selected = await showPickerView<WorkspaceManager>
            (this.workspaceManagers, true, prompt);

        return selected || [];
    }

}

export interface NugetExplorerView {
    refresh(): void;
}
