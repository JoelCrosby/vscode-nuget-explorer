import { WorkspaceManager } from "./manager/WorkspaceManager";
import { NugetPackageTreeItem } from "./views/TreeItems/NugetPackageTreeItem";
import { showProgressPopup, showMessage, showPickerView } from "./utils";
import { updateService } from "./nuget/UpdateService";
import { searchService } from "./nuget/SearchService";

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

            const selected = await showPickerView<WorkspaceManager>
                (this.workspaceManagers, true, 'Select Projects');

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
        showProgressPopup('NuGet Removing Package ' + item.label, async () => {
            await item.manager.nugetManager.uninstall(item);
            showMessage(`NuGet Package ${item.label} Removed`);
            this.refresh();
        });
    }

}

export interface NugetExplorerView {
    refresh(): void;
}
