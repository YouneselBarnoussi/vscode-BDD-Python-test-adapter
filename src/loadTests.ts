import * as vscode from 'vscode';
import * as fs from 'fs';
import {runScript} from './processExecution';
import { ScriptConfiguration } from './scriptConfiguration';

export async function loadTests(controller: vscode.TestController) {
	try {
		const workspacePath = (vscode.workspace.workspaceFolders || [])[0].uri.fsPath;
        const loadScriptConfiguration = new ScriptConfiguration(['python -m behave'], workspacePath, ['--dry-run'], {shell: process.env.ComSpec})

		let result = await runScript(loadScriptConfiguration).complete();

		return Promise.resolve<vscode.TestItem[]>(parseTestSuites(controller, result.output, workspacePath));
	}catch(e: any){
		throw e;
	}
}

async function parseTestSuites(controller: vscode.TestController, output: string, workspacePath :string):  Promise<vscode.TestItem[]>{
	let features: vscode.TestItem[] = [];

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
			// TODO line number??
			features.push(controller.createTestItem(title, title, vscode.Uri.file(filePath)));
		} else if (outputByLine[j].includes('Scenario')) {
			let scenarioTitle = '';
			let lastFeature = (features[features.length - 1] as vscode.TestItem);

			if(title.includes('--')){
				scenarioTitle = title.split(' --')[0];

				lineNumber = getScenarioLineNumber((lastFeature.uri?.fsPath as string), scenarioTitle);

				if(lineNumber == -1){
					lineNumber = undefined;
				}
			}else{
				scenarioTitle = title;
			}

			if(! lastFeature.children.get(scenarioTitle)){
				// TODO line number?
				lastFeature.children.add(
					controller.createTestItem(scenarioTitle, scenarioTitle, vscode.Uri.file(filePath))
				);
			}
		}
	}

	return new Promise<vscode.TestItem[]>((resolve) => {
		resolve(features);
	});	
}

function getScenarioLineNumber(file: string, title: string) : number{
	let fileContent = fs.readFileSync(file, 'utf8').split('\n');
	for(var j = 0; j < fileContent.length; j++){
		if(fileContent[j].includes(title)){
			return j;
		}
	}

	return -1;
}