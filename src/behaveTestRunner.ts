import * as vscode from 'vscode';
import { Log } from 'vscode-test-adapter-util';
import * as fs from 'fs';
import {runScript, ProcessExecution} from './processExecution';
import {ScriptConfiguration} from './scriptConfiguration';
import { TestSuiteInfo, TestInfo, TestRunStartedEvent, TestRunFinishedEvent, TestSuiteEvent, TestEvent } from 'vscode-test-adapter-api';

export class behaveTestRunner{
	private readonly testExecutions: Map<string, ProcessExecution>;
	private loadScriptConfiguration: ScriptConfiguration;
	private runScriptConfiguration: ScriptConfiguration;
	private testSuite: TestSuiteInfo;
	private logger: Log;

	constructor(workspaceRoot : vscode.Uri, logger: Log){
		this.testExecutions = new Map<string, ProcessExecution>();
		this.loadScriptConfiguration = new ScriptConfiguration(['python -m behave'], workspaceRoot.fsPath, ['--dry-run'], {shell: process.env.ComSpec});
		this.runScriptConfiguration = new ScriptConfiguration(['python -m behave'], workspaceRoot.fsPath, ['-n'], {shell: process.env.ComSpec})
		this.logger = logger;
		this.testSuite = {
			type: 'suite',
			id: '',
			label: '',
			children: [],
		};
	}


	async loadTests(workspaceRoot: vscode.Uri): Promise<TestSuiteInfo> {
		try {
			let workspacePath = workspaceRoot.fsPath;

			await this.runBehave(workspacePath);			
		}catch(e){
			throw new Error(e);
		}
		
		return Promise.resolve<TestSuiteInfo>(this.testSuite);
	}

	async cancel(){
		this.testExecutions.forEach((execution, test) => {
            this.logger.info('info', `Cancelling execution of ${test}`);
            try {
                execution.cancel();
            } catch (error) {
                this.logger.warn('crit', `Cancelling execution of ${test} failed: ${error}`);
            }
        });
	}

	async runBehave(workspacePath: string){
		let result = await runScript(this.loadScriptConfiguration).complete();
		this.testSuite.children = await this.parseTestSuites(result.output, workspacePath);
	}

	async parseTestSuites(output: string, workspacePath :string):  Promise<TestSuiteInfo[]>{
		let features: TestSuiteInfo[] = [];

		let outputByLine: string[] = output.split('\n').filter(Boolean);
		workspacePath = workspacePath.replace(/\\/g, "/")
		for (let j = 0; j < outputByLine.length; j++) {
			let title, filePath, lineNumber, line = outputByLine[j].split(/[:#]/);
			
			try {
				
				title = line[1].trim();
				filePath = workspacePath + '/' + line[2].trim();
				lineNumber = parseInt(line[3].trim()) - 1;
			} catch {
				title = '';
				filePath = '';
				lineNumber = 0;
			}

			if (outputByLine[j].includes('Feature')) {
				features.push({
					type: 'suite',
					id: title,
					label: title,
					file: filePath,
					line: lineNumber,
					children: [],
				});
			} else if (outputByLine[j].includes('Scenario')) {
				let scenarioTitle = '';
				let lastFeature = (features[features.length - 1] as TestSuiteInfo);

				if(title.includes('--')){
					scenarioTitle = title.split(' --')[0];

					lineNumber = this.getScenarioLineNumber((lastFeature.file as string), scenarioTitle);

					if(lineNumber == -1){
						lineNumber = undefined;
					}
				}else{
					scenarioTitle = title;
				}

				if(!lastFeature.children.some(s => s.label === scenarioTitle)){
					lastFeature.children.push({
						type: 'test',
						id: scenarioTitle,
						label: scenarioTitle,
						file: filePath,
						line: lineNumber,
					});
				}
			}
		}

		return new Promise<TestSuiteInfo[]>((resolve) => {
			resolve(features);
		});	
	}

	getScenarioLineNumber(file: string, title: string) : number{
		let fileContent = fs.readFileSync(file, 'utf8').split('\n');
		for(var j = 0; j < fileContent.length; j++){
			if(fileContent[j].includes(title)){
				return j;
			}
		}

		return -1;
	}

	async debugTests(tests: string[], workspace: vscode.WorkspaceFolder, log: Log){
		for (const suiteOrTestId of tests) {
			const node = this.findNode(this.testSuite, suiteOrTestId);
			if (node) {
				return new Promise<void>(() => {
					vscode.debug.startDebugging(workspace, {
							name: `Debug ${tests[0]}`,
							type: 'python',
							request: 'launch',
							module: 'behave',
							console: 'internalConsole',
							cwd: '${workspaceFolder}',
							args: [
								`${node.file}`,
								'-n',
								`${node.id}`
							]
						},
					).then(
						() => { /* intentionally omitted */ },
						exception => log.error('crit', `Failed to start debugging tests: ${exception}`)
					);
				});
			}
		}
	}

	async runTests(
		tests: string[],
		testStatesEmitter: vscode.EventEmitter<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>,
		workspaceUri: vscode.Uri
	): Promise<void> {
		for (const suiteOrTestId of tests) {
			const node = this.findNode(this.testSuite, suiteOrTestId);
			if (node) {
				await this.runNode(node, testStatesEmitter, workspaceUri);
			}
		}
	}

	findNode(searchNode: TestSuiteInfo | TestInfo, id: string): TestSuiteInfo | TestInfo | undefined {
		if (searchNode.id === id) {
			return searchNode;
		} else if (searchNode.type === 'suite') {
			for (const child of searchNode.children) {
				const found = this.findNode(child, id);
				if (found) return found;
			}
		}
		return undefined;
	}

	async runNode(
		node: TestSuiteInfo | TestInfo,
		testStatesEmitter: vscode.EventEmitter<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>,
		workspaceUri: vscode.Uri
	): Promise<void> {

		if (node.type === 'suite') {

			testStatesEmitter.fire(<TestSuiteEvent>{ type: 'suite', suite: node.id, state: 'running' });

			for (const child of node.children) {
				await this.runNode(child, testStatesEmitter, workspaceUri);
			}

			testStatesEmitter.fire(<TestSuiteEvent>{ type: 'suite', suite: node.id, state: 'completed' });

		} else { // node.type === 'test'

			testStatesEmitter.fire(<TestEvent>{ type: 'test', test: node.id, state: 'running' });

			try {
				let testExecution = runScript(this.runScriptConfiguration, [`"${node.file}"`, '-n', `"${node.label}"`])
				this.testExecutions.set(node.label, testExecution);
				let result = await testExecution.complete();
				this.testExecutions.delete(node.label);
				if(result.exitCode === 0){
					testStatesEmitter.fire(<TestEvent>{ type: 'test', test: node.id, state: 'passed' });
				}else{
					testStatesEmitter.fire(<TestEvent>{ type: 'test', test: node.id, state: 'failed', message: result.output });
				}
  
			} catch(e) {
				if(e.exitCode === null){
					testStatesEmitter.fire(<TestEvent>{ type: 'test', test: node.id, state: 'skipped' });
				}else{
					testStatesEmitter.fire(<TestEvent>{ type: 'test', test: node.id, state: 'errored', message: e });
				}
			}


		}
	}
}