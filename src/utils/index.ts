import * as vscode from 'vscode';

export function isArray(o: any) {
    return Object.prototype.toString.apply(o) === '[object Array]';
}

export async function ShowProgressPopup(message: string, task: () => Promise<void>): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: message,
        cancellable: false
    }, async () => await task());
}

