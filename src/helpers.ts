import * as vscode from 'vscode';

export function getInterpreter(): string {
    return getPathFromConfig('python', 'defaultInterpreterPath', 'python');
}

export function getFeaturesFolder(): string {
    return getPathFromConfig('behaveTestAdapter', 'featuresFolderPath', 'features');
}

function getPathFromConfig(section: string, key: string, backup: string = ''): string {
    const workspacePath = (vscode.workspace.workspaceFolders || [])[0]?.uri?.fsPath ?? '';

    const config = vscode.workspace.getConfiguration(section);

    return config.get(key, backup).replace('${workspaceFolder}', workspacePath);
}
