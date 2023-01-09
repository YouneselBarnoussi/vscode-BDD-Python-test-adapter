import * as vscode from 'vscode';
import { runScript } from './processExecution';
import { ScriptConfiguration } from './scriptConfiguration';

export async function runTests(
    controller: vscode.TestController,
	request: vscode.TestRunRequest,
    debug: boolean = false,
): Promise<void> {
    const run = controller.createTestRun(request);

	if (request.include) {
		await Promise.all(request.include.map(t => debug ? debugNode(t, request, run) : runNode(t, request, run)));
	} else {
		await Promise.all(mapTestItems(controller.items, t => debug ? debugNode(t, request, run) : runNode(t, request, run)));
	}

	run.end();
}

async function runNode(
	node: vscode.TestItem,
	request: vscode.TestRunRequest,
	run: vscode.TestRun,
): Promise<void> {
    if (request.exclude?.includes(node)) {
		return;
	}

    if (node.children.size > 0) {
        await Promise.all(mapTestItems(node.children, t => runNode(t, request, run)));
    } else {
        run.started(node);

        try {
            const workspacePath = (vscode.workspace.workspaceFolders || [])[0].uri.fsPath;
            const runScriptConfiguration = new ScriptConfiguration(['python -m behave'], workspacePath, ['-n'], {shell: process.env.ComSpec});

            let testExecution = runScript(runScriptConfiguration, [`"${node.uri?.fsPath}"`.replace(/\\/g, '\\\\'), '-n', `"${node.label}"`])
            let result = await testExecution.complete();
            if(result.exitCode === 0){
                run.passed(node, result.duration);
            }else{
                run.failed(node, new vscode.TestMessage(result.output), result.duration);
            }
        } catch(e: any) {
            if(e.exitCode === null){
                run.skipped(node);
            }else{
                run.errored(node, new vscode.TestMessage(e));
            }
        }
    }
}

async function debugNode(
	node: vscode.TestItem,
	request: vscode.TestRunRequest,
	run: vscode.TestRun,
): Promise<void> {
    if (request.exclude?.includes(node)) {
		return;
	}

    vscode.debug.startDebugging((vscode.workspace.workspaceFolders || [])[0], {
            name: `Debug ${node.label}`,
            type: 'python',
            request: 'launch',
            module: 'behave',
            console: 'internalConsole',
            cwd: '${workspaceFolder}',
            args: [
                `${node.uri?.fsPath}`,
                '-n',
                `${node.id}`
            ]
        },
    );

    // TODO: Figure out a way to see if the test was succesfull using the debug session.
    await runNode(node, request, run);
}

const mapTestItems = <T>(items: vscode.TestItemCollection, mapper: (t: vscode.TestItem) => T): T[] => {
	const result: T[] = [];
	items.forEach(t => result.push(mapper(t)));
	return result;
}