export class ScriptConfiguration{
    commands: string[];
    cwd?: string;
    args?: string[];
    options?:  { [key: string]: string | undefined };

    constructor(commands: string[], cwd?: string, args?: string[], options?:  { [key: string]: any }){
        this.commands = commands;
        this.cwd = cwd;
        this.args = args;
        this.options = options;
    }

    getCommands(): string{
        return this.commands.join(' && ');
    }

}
