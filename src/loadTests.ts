import * as fs from 'fs';
import * as vscode from 'vscode';
import {ScriptConfiguration} from './scriptConfiguration';
import {getInterpreter} from './helpers';
import {runScript} from './processExecution';

export async function loadTests(controller: vscode.TestController): Promise<vscode.TestItem[]> {
    const workspacePath = (vscode.workspace.workspaceFolders || [])[0]?.uri?.fsPath ?? '';

    const loadScriptConfiguration = new ScriptConfiguration([`${getInterpreter()} -m behave`], workspacePath, ['--dry-run'], {shell: process.env.ComSpec});

    const result = await runScript(loadScriptConfiguration).complete();

    return Promise.resolve<vscode.TestItem[]>(parseTestSuites(controller, result.output, workspacePath));
}

export async function parseTestSuites(controller: vscode.TestController, output: string, workspacePath: string):  Promise<vscode.TestItem[]>{
    const features: vscode.TestItem[] = [];

    const outputByLine: string[] = output.split('\n').filter(Boolean);
    const path = workspacePath.replace(/\\/g, "/");

    for (let j = 0; j < outputByLine.length; j++) {
        // eslint-disable-next-line prefer-const
        let title, filePath, lineNumber, line = outputByLine[j].split(/[:#]/);

        try {
            title = line[1].trim();
            filePath = path + '/' + line[2].trim();
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
            const lastFeature = (features[features.length - 1] as vscode.TestItem);

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

    return new Promise<vscode.TestItem[]>((resolve: (value: vscode.TestItem[] | PromiseLike<vscode.TestItem[]>) => void) => {
        resolve(features);
    });
}

function getScenarioLineNumber(file: string, title: string): number{
    const fileContent = fs.readFileSync(file, 'utf8').split('\n');
    for(let j = 0; j < fileContent.length; j++){
        if(fileContent[j].includes(title)){
            return j;
        }
    }

    return -1;
}
