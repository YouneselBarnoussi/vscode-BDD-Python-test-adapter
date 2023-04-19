import * as assert from 'assert';
import * as vscode from 'vscode';
import {beforeEach} from 'mocha';
import {getInterpreter} from '../../helpers';

suite('helpers.ts', () => {
    vscode.window.showInformationMessage('Start helpers tests.');

    beforeEach(async function() {
        await vscode.workspace.getConfiguration('python').update('defaultInterpreterPath', undefined);
    });

    test('It gets interpreter if not defined', async () => {
        const value = getInterpreter();

        assert.strictEqual(value, 'python');
    });

    test('It gets interpreter if defined', async () => {
        const path = 'my/path';

        await vscode.workspace.getConfiguration('python').update('defaultInterpreterPath', path);

        const value = getInterpreter();

        assert.strictEqual(value, path);
    });

    test('It gets interpreter if defined with workspace variable', async () => {
        const path = '${workspaceFolder}/my/path';

        await vscode.workspace.getConfiguration('python').update('defaultInterpreterPath', path);

        const value = getInterpreter();

        assert.strictEqual(value, path.replace(
            '${workspaceFolder}', (vscode.workspace.workspaceFolders || [])[0]?.uri?.fsPath ?? ''
        ));
    });
});
