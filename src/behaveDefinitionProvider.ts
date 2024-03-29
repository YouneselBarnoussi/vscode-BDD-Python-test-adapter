import * as vscode from 'vscode';
import {getFeaturesFolder, getInterpreter} from './helpers';
import {KeyStep} from './keyStepArray';
import {ScriptConfiguration} from './scriptConfiguration';
import {runScript} from './processExecution';

export class BehaveDefinitionProvider implements vscode.DefinitionProvider{
    public steps: KeyStep;

    constructor(workspaceUri: vscode.Uri){
        this.steps = {};
        this.getSteps(workspaceUri?.fsPath ?? '').then((e: KeyStep) => {
            this.steps = e;
        });
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        if (vscode.workspace.getConfiguration('behaveTestAdapter').get('enableDefintionProvider', true)) {
            const line = document.lineAt(position.line).text.trim();

            if(line.includes('Then') || line.includes('Given') || line.includes('When') || line.includes('And')){
                const regex = /'(.*?)'/g;
                let formattedLine = line.replace(regex, '');
                formattedLine = formattedLine.trim();

                const stepDefinition = this.steps[formattedLine];

                if(stepDefinition){
                    return new vscode.Location(vscode.Uri.file(stepDefinition.file), new vscode.Position(stepDefinition.line, 0));
                }

                return null;
            }else{
                return null;
            }
        }

        return null;
    }

    async getSteps(workspacePath: string): Promise<KeyStep>{
        const loadScriptConfiguration = new ScriptConfiguration([`${getInterpreter()} -m behave ${getFeaturesFolder()}`], workspacePath, ['--dry-run'], {shell: process.env.ComSpec});

        const result = await runScript(loadScriptConfiguration).complete();

        const {output} = result;

        const steps: KeyStep = {};
        const outputByLine: string[] = output.split('\n').filter(Boolean);
        try{
            for (let j = 0; j < outputByLine.length; j++) {

                if (outputByLine[j].includes('Then') || outputByLine[j].includes('Given') || outputByLine[j].includes('When') || outputByLine[j].includes('And')) {
                    const line = outputByLine[j].split(/[:#]/);

                    if(line.length === 3){
                        const label: string = line[0].trim();
                        const filePath = workspacePath + '/' + line[1].trim();
                        const lineNumber = parseInt(line[2].trim());
                        const regex = /'(.*?)'/g;
                        const formattedLabel = label.replace(regex, '').trim();

                        steps[formattedLabel] = {file: filePath, line: lineNumber};
                    }
                }
            }
        }catch(e){
            return Promise.reject(e);
        }

        return Promise.resolve(steps);
    }
}
