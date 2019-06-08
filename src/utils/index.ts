import * as vscode from 'vscode';

export async function showProgressPopup(message: string, task: () => Promise<void>): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: message,
        cancellable: false
    }, async () => await task());
}

export function showMessage(message: string): void {
    vscode.window.showInformationMessage(message);
}

export function showErrorMessage(message: string): void {
    vscode.window.showErrorMessage(`[NuGet Explorer] ${message}`);
}

export function showPickerView<T extends PickerViewItem>(items: Array<T>, canPickManay: boolean, placeholder: string) {
    return vscode.window.showQuickPick<T>(
        items, { canPickMany: true, placeHolder: placeholder });
}

export interface PickerViewItem {
    label: string;
    description?: string;
    detail?: string;
    picked?: boolean;
    alwaysShow?: boolean;
}

export async function showInputBox(prompt: string, placeHolder: string) {
    return vscode.window.showInputBox({ prompt, placeHolder });
}
