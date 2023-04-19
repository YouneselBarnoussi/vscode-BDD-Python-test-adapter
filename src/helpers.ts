import * as vscode from 'vscode';

export function getInterpreter(): string {
    const workspacePath = (vscode.workspace.workspaceFolders || [])[0]?.uri?.fsPath ?? '';

    const config = vscode.workspace.getConfiguration('python');

    return config.get('defaultInterpreterPath', 'python').replace('${workspaceFolder}', workspacePath);
}
