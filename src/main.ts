import * as vscode from 'vscode';
import { TestHub, testExplorerExtensionId } from 'vscode-test-adapter-api';
import { Log, TestAdapterRegistrar } from 'vscode-test-adapter-util';
import { BehaveTestAdapter } from './behaveTestAdapter';
import { behaveTestRunner } from './behaveTestRunner';
import {BehaveDefinitionProvider} from './behaveDefinitionProvider';

export async function activate(context: vscode.ExtensionContext) {

	const workspaceFolder = (vscode.workspace.workspaceFolders || [])[0];

	// create a simple logger that can be configured with the configuration variables
	// `exampleExplorer.logpanel` and `exampleExplorer.logfile`
	const log = new Log('beahaveExplorer', workspaceFolder, 'Behave Explorer Log');
	context.subscriptions.push(log);

	// get the Test Explorer extension
	const testExplorerExtension = vscode.extensions.getExtension<TestHub>(testExplorerExtensionId);
	if (log.enabled) log.info(`Test Explorer ${testExplorerExtension ? '' : 'not '}found`);

	if (testExplorerExtension) {
		const testHub = testExplorerExtension.exports;

		// this will register an TestAdapater for each WorkspaceFolder
		context.subscriptions.push(new TestAdapterRegistrar(
			testHub,
			workspaceFolder => new BehaveTestAdapter(workspaceFolder, log, new behaveTestRunner(workspaceFolder.uri, log)),
			log
		));
		
		const definitionProviderDisposable = vscode.languages.registerDefinitionProvider({pattern: '**/*.feature'}, new BehaveDefinitionProvider(workspaceFolder.uri));
		context.subscriptions.push(definitionProviderDisposable);
	}
}
