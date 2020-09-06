import * as vscode from 'vscode';
import { TestAdapter, TestLoadStartedEvent, TestLoadFinishedEvent, TestRunStartedEvent, TestRunFinishedEvent, TestSuiteEvent, TestEvent } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { behaveTestRunner } from './behaveTestRunner';

/**
 * This class is intended as a starting point for implementing a "real" TestAdapter.
 * The file `README.md` contains further instructions.
 */
export class BehaveTestAdapter implements TestAdapter {

	private disposables: { dispose(): void }[] = [];

	private readonly testsEmitter = new vscode.EventEmitter<TestLoadStartedEvent | TestLoadFinishedEvent>();
	private readonly testStatesEmitter = new vscode.EventEmitter<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>();
	private readonly autorunEmitter = new vscode.EventEmitter<void>();

	get tests(): vscode.Event<TestLoadStartedEvent | TestLoadFinishedEvent> { return this.testsEmitter.event; }
	get testStates(): vscode.Event<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent> { return this.testStatesEmitter.event; }
	get autorun(): vscode.Event<void> | undefined { return this.autorunEmitter.event; }

	constructor(
		public readonly workspace: vscode.WorkspaceFolder,
		private readonly log: Log,
		private readonly testRunner: behaveTestRunner
	) {

		this.log.info('Initializing test adapter');

		vscode.workspace.onDidSaveTextDocument(document => {
			if (this.isTestFile(document.uri)) {
				this.load();
			}
		});

		this.disposables.push(this.testsEmitter);
		this.disposables.push(this.testStatesEmitter);
		this.disposables.push(this.autorunEmitter);
	}

	isTestFile(uri: vscode.Uri): Boolean{
		var re = /(?:\.([^.]+))?$/;
		var ext = re.exec(uri.path)![1];
		if(ext === 'feature' || ext === 'py'){
			return true;
		}
		return false;
	}

	async load(): Promise<void> {

		this.log.info('Loading tests');

		this.testsEmitter.fire(<TestLoadStartedEvent>{ type: 'started' });

		const loadedTests = await this.testRunner.loadTests(this.workspace.uri);

		this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished', suite: loadedTests });

	}

	async run(tests: string[]): Promise<void> {

		this.log.info(`Running tests ${JSON.stringify(tests)}`);

		this.testStatesEmitter.fire(<TestRunStartedEvent>{ type: 'started', tests });

		await this.testRunner.runTests(tests, this.testStatesEmitter, this.workspace.uri);

		this.testStatesEmitter.fire(<TestRunFinishedEvent>{ type: 'finished' });

	}	

	async debug(tests: string[]): Promise<void> {
		await this.testRunner.debugTests(tests, this.workspace, this.log);
	}


	cancel(): void {
		this.testRunner.cancel();
	}

	dispose(): void {
		this.cancel();
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
		this.disposables = [];
	}
}
