import * as assert from 'assert';
import * as vscode from 'vscode';
import { Timer } from '../../timer';

suite('timer.ts', () => {
	vscode.window.showInformationMessage('Start timer tests.');

	test('It times', async () => {
        const t = new Timer();

        t.start();

        await new Promise<void>(f => setTimeout(f, 1000));

        assert.strictEqual(
			Math.round(t.ms/1000)*1000,
            1000
		);
	});
});