import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('It registers the extension', () => {
		assert.strictEqual(
			vscode.extensions.getExtension('YouneselBarnoussi.vscode-behave-test-adapter') !== undefined,
			true,
		);
	});
});