import * as vscode from 'vscode';
import {runScript} from './processExecution';
import {ScriptConfiguration} from './scriptConfiguration';
import {KeyStep} from './keyStepArray';

export class BehaveDefinitionProvider implements vscode.DefinitionProvider{
	private loadScriptConfiguration: ScriptConfiguration;
    public steps: KeyStep;

    constructor(workspaceUri: vscode.Uri){
        this.loadScriptConfiguration = new ScriptConfiguration(['cd', 'behave'], workspaceUri.fsPath, ['--dry-run'], {shell: process.env.ComSpec});
        this.steps = {};
        this.getSteps(workspaceUri.fsPath).then(e => {
            this.steps = e;
        })
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        let line = document.lineAt(position.line).text.trim();

        if(line.includes('Then') || line.includes('Given') || line.includes('When') || line.includes('And')){
            let regex = /\'(.*?)\'/g;
            let formattedLine = line.replace(regex, '');
            formattedLine = formattedLine.trim();

            let stepDefinition = this.steps[formattedLine];

            if(stepDefinition){
                return new vscode.Location(vscode.Uri.file(stepDefinition.file), new vscode.Position(stepDefinition.line, 0));     
            }

            return null;
        }else{
            return null;
        }
    }

    async getSteps(workspacePath :string): Promise<KeyStep>{
        let result = await runScript(this.loadScriptConfiguration).complete();

        let output = result.output;

        let steps: KeyStep = {};
        let outputByLine: string[] = output.split('\n').filter(Boolean);
        try{
            for (let j = 0; j < outputByLine.length; j++) {

                if (outputByLine[j].includes('Then') || outputByLine[j].includes('Given') || outputByLine[j].includes('When') || outputByLine[j].includes('And')) {
                    let line = outputByLine[j].split(/[:#]/);

                    
                    if(line.length === 3){
                        let label: string = line[0].trim();
                        let filePath = workspacePath + '/' + line[1].trim();
                        let lineNumber = parseInt(line[2].trim());
                        let regex = /\'(.*?)\'/g;
                        let formattedLabel = label.replace(regex, '').trim();


                        steps[formattedLabel] = {file: filePath, line: lineNumber};
                    }
                } 
            }

        }catch(e){
            console.log(e);
            return Promise.reject(e);
        }

        return Promise.resolve(steps);
    }
}