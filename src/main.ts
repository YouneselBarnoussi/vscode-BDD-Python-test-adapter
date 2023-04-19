import * as vscode from 'vscode';
import {BehaveDefinitionProvider} from './behaveDefinitionProvider';
import {loadTests} from './loadTests';
import {runTests} from './runTests';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const controller = vscode.tests.createTestController('behave-test-adapter', 'Behave test controller');

    context.subscriptions.push(controller);

    controller.resolveHandler = async (_test: vscode.TestItem | undefined) => {
        controller.items.replace(await loadTests(controller));
    };

    controller.createRunProfile('Run', vscode.TestRunProfileKind.Run, async (request: vscode.TestRunRequest) => await runTests(controller, request), true);
    controller.createRunProfile('Debug', vscode.TestRunProfileKind.Debug, async (request: vscode.TestRunRequest) => await runTests(controller, request, true), true);

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            {pattern: '**/*.feature'},
            new BehaveDefinitionProvider((vscode.workspace.workspaceFolders || [])[0]?.uri),
        ),
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e: vscode.ConfigurationChangeEvent) => {
            if (e.affectsConfiguration('python') || e.affectsConfiguration('behaveTestAdapter')) {
                controller.items.replace(await loadTests(controller));
            }
        })
    );
}
