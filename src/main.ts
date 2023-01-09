import * as vscode from 'vscode';
import { loadTests } from './loadTests';
import { runTests } from './runTests';
import { BehaveDefinitionProvider } from './behaveDefinitionProvider';

export async function activate(context: vscode.ExtensionContext) {
	const controller = vscode.tests.createTestController('behave-test-adapter', 'Behave test controller');

	context.subscriptions.push(controller);

	controller.resolveHandler = async test => {
		controller.items.replace(await loadTests(controller));
	};

	controller.createRunProfile('Run', vscode.TestRunProfileKind.Run, async request => await runTests(controller, request), true);
	controller.createRunProfile('Debug', vscode.TestRunProfileKind.Debug, async request => await runTests(controller, request, true), true);

	context.subscriptions.push(
		vscode.languages.registerDefinitionProvider(
			{pattern: '**/*.feature'},
			new BehaveDefinitionProvider((vscode.workspace.workspaceFolders || [])[0].uri),
		),
	);
}
