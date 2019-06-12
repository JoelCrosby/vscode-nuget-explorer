import { WorkspaceManager } from './manager/WorkspaceManager';
import { NugetPackageTreeItem } from './views/TreeItems/NugetPackageTreeItem';
import { showProgressPopup, showMessage, showPickerView, showErrorMessage } from './utils/host';
import { UpdateService } from './nuget/UpdateService';
import { searchService } from './nuget/SearchService';
import { NugetPackage } from './models/NugetPackage';


/**
 * Main class for orchastrating Tasks.
 *
 * @export
 * @class NugetExplorer
 */
export class NugetExplorer {

    constructor(
        private workspaceManagers: WorkspaceManager[],
        private installedView: NugetExplorerView,
        private updatesView: NugetExplorerView) { }


    /**
     * Rescans each worksapce for installed packages and refrehes view.
     *
     * @memberof NugetExplorer
     */
    async refresh() {
        const refreshTasks: Promise<void>[] = [];

        this.workspaceManagers.forEach(manager => refreshTasks.push(manager.refresh()));

        await Promise.all(refreshTasks);

        this.installedView.refresh();
        this.updatesView.refresh();
    }


    /**
     * Checks for updates for a single package.
     *
     * @param {NugetPackage} nugetPackage package to check for updates
     * @memberof NugetExplorer
     */
    async checkForUpdates(nugetPackage: NugetPackage) {

        if (!nugetPackage) { return; }

        await showProgressPopup('NuGet checking for package updates', async () => {
            try {
                const result = await UpdateService.checkForUpdates(nugetPackage);
                if (result.length) {
                    showMessage('NuGet package update available');
                } else {
                    showMessage('NuGet package up to date');
                }
            } catch (error) {
                showErrorMessage(error.message);
                return;
            }

            this.installedView.refresh();
        });
    }


    /**
     * Checks for updates for all packages installed in all workspaces.
     *
     * @param {boolean} [silent] Whether to show progress message
     * @memberof NugetExplorer
     */
    async checkForUpdatesAll(silent: boolean = false) {
        if (silent) {
            await this.manageCheckForUpdatesAll(silent);
        } else {
            await showProgressPopup('NuGet checking for package updates', async () => {
                await this.manageCheckForUpdatesAll(silent);
            });
        }
    }


    private async manageCheckForUpdatesAll(silent: boolean = false) {
        const updateTasks: Promise<string[]>[] = [];

        this.workspaceManagers.forEach(manager => {
            manager.packages.forEach(nugetPackage => {
                updateTasks.push(UpdateService.checkForUpdates(nugetPackage));
            });
        });


        try {
            const results = await Promise.all(updateTasks);

            this.workspaceManagers.forEach(manager => {
                manager.refreshUpdates();
            });

            if (silent) { return; }

            if (results.filter(result => result.length).length) {
                showMessage('NuGet package updates are available');
            } else {
                showMessage('NuGet All packages up to date');
            }
        } catch (error) {
            showErrorMessage(error.message);
            return;
        }

        this.installedView.refresh();
        this.updatesView.refresh();
    }

    /**
     * Shows prompt to select packages to install and then installs them.
     *
     * @param {NugetPackageTreeItem} [item]
     * @returns
     * @memberof NugetExplorer
     */
    async managePackageInstall(item?: NugetPackageTreeItem) {

        const packages = await searchService.search();

        if (!packages || !packages.length) { return; }

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
                    selected.forEach(manager =>
                        installQueue.push(manager.nugetManager.installPackages(packages)));
                    await Promise.all(installQueue);
                });
            }
        }

        showMessage('NuGet Package(s) installed');
        this.refresh();
    }


    /**
     * Shows prompt to select packages to uninstall and then uninstalls them.
     *
     * @param {NugetPackageTreeItem} item
     * @memberof NugetExplorer
     */
    async managePackageUnInstall(item: NugetPackageTreeItem) {

        const unistallTasks: Promise<void>[] = [];

        let progressMessage = 'NuGet Removing Packages';
        let completionMessage = 'NuGet Packages Removed';

        if (!item) {
            const packages = await this.promptSelectPackages(
                'Select packages to remove',
                'Select Projects to remove packages from');
            packages.forEach(nugetPackage =>
                unistallTasks.push(nugetPackage.manager.nugetManager.uninstall(nugetPackage)));
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


    /**
     * Shows prompt to select packages to update and then updates them.
     *
     * @param {NugetPackageTreeItem} item
     * @memberof NugetExplorer
     */
    async managePackageUpdate(item: NugetPackageTreeItem) {
        const updateTasks: Promise<void>[] = [];

        let progressMessage = 'NuGet Updating Packages';
        let completionMessage = 'NuGet Packages Updated';

        if (!item) {
            const packages = await this.promptSelectPackages(
                'Select packages to update',
                'Select Projects to update packages from');
            packages.forEach(nugetPackage =>
                updateTasks.push(nugetPackage.manager.nugetManager.update(nugetPackage)));
        } else {
            if (item.nugetPackage) {
                progressMessage = `NuGet Updating Package ${item.label}`;
                completionMessage = `NuGet Package ${item.label} Updated`;
                updateTasks.push(item.manager.nugetManager.update(item.nugetPackage));
            }
        }

        await showProgressPopup(progressMessage, async () => {
            await Promise.all(updateTasks);
        });

        showMessage(completionMessage);
        this.refresh();
    }

    /**
     * Show picker view with installed packages from selected workspace.
     *
     * @private
     * @param {string} [prompt='Select Packages']
     * @param {string} [workspacesPrompt='Select Projects']
     * @returns {Promise<NugetPackage[]>}
     * @memberof NugetExplorer
     */
    private async promptSelectPackages(
        prompt: string = 'Select Packages',
        workspacesPrompt: string = 'Select Projects'): Promise<NugetPackage[]> {

        if (this.workspaceManagers.length === 1) {
            const selected = await showPickerView<NugetPackage>(
                this.workspaceManagers[0].packages, true, prompt);
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


    /**
     * Show picker view to select workspaces.
     *
     * @private
     * @param {string} [prompt='Select Projects']
     * @returns {Promise<WorkspaceManager[]>}
     * @memberof NugetExplorer
     */
    private async promptSelectWorkspaces(prompt: string = 'Select Projects'): Promise<WorkspaceManager[]> {
        const selected = await showPickerView<WorkspaceManager>
            (this.workspaceManagers, true, prompt);

        return selected || [];
    }

}

export interface NugetExplorerView {
    refresh(): void;
}
