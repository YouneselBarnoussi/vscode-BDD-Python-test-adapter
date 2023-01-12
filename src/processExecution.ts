import * as iconv from 'iconv-lite';
import {ChildProcess, spawn} from 'child_process';
import {EOL} from 'os';
import {ScriptConfiguration} from './scriptConfiguration';
import {Timer} from './timer';

export class ProcessExecution {
    public readonly pid: number;

    private readonly process: ChildProcess;

    private readonly timer;

    constructor(
        args: string[],
        configuration: ScriptConfiguration,
    ) {
        this.process = spawn(
            configuration.getCommands(),
            args,
            {
                cwd: configuration.cwd,
                ...configuration.options,
            });
        this.pid = this.process.pid;
        this.timer = new Timer();
        this.timer.start();
    }

    public async complete(): Promise<{ exitCode: number | null; output: string; duration: number }> {
        return new Promise<{ exitCode: number | null; output: string; duration: number }>((resolve: (value: {
            exitCode: number | null;
            output: string;
            duration: number;
        } | PromiseLike<{
            exitCode: number | null;
            output: string;
            duration: number;
        }>) => void, reject: (reason?: any) => void) => {
            const stdoutBuffer: Buffer[] = [];
            const stderrBuffer: Buffer[] = [];
            this.process.stdout!.on('data', (chunk: any) => stdoutBuffer.push(chunk));
            this.process.stderr!.on('data', (chunk: any) => stderrBuffer.push(chunk));

            this.process.once('exit', (exitCode: number | null) => {
                if(exitCode === null && this.process.killed){
                    reject({exitCode: exitCode, message: `process cancelled`});
                }

                const output = decode(stdoutBuffer);
                if (!output) {
                    if (stdoutBuffer.length > 0) {
                        reject('Can not decode output from the process');
                    } else if (stderrBuffer.length > 0 && !this.process.killed) {
                        reject(`process returned an error:${EOL}${decode(stderrBuffer)}`);
                    }
                }

                const duration = this.timer.ms;

                resolve({exitCode, output, duration});
            });

            this.process.once('error', (error: Error) => {
                reject(`Error occurred during process execution: ${error}`);
            });
        });
    }

    public cancel(): void {
        this.process.kill('SIGINT');
    }
}

function run(
    args: string[],
    configuration: ScriptConfiguration,
    extraArguments: string[]
): ProcessExecution {
    const allArgs = args.concat(extraArguments);
    return new ProcessExecution(allArgs, configuration);
}

export function runScript(configuration: ScriptConfiguration, extraArguments?: (string | undefined)[]): ProcessExecution {
    return run(configuration.args || [], configuration, extraArguments as string[]);
}

function decode(buffers: Buffer[]): string {
    return iconv.decode(Buffer.concat(buffers), 'utf8');
}
