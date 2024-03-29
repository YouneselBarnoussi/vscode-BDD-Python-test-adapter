import * as cp from 'child_process';
import * as path from 'path';
import {downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests} from '@vscode/test-electron';

async function main(): Promise<void> {
    try {
        /*
         * The folder containing the Extension Manifest package.json
         * Passed to `--extensionDevelopmentPath`
         */
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        /*
         * The path to the extension test script
         * Passed to --extensionTestsPath
         */
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        /*
         * The path to the extension test script
         * Passed to --launchArgs
         */
        const launchArgs = [path.resolve(__dirname, './suite/support')];

        const vscodeExecutablePath = await downloadAndUnzipVSCode('1.77.3');
        const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        cp.spawnSync(
            cliPath,
            [...args, '--install-extension', 'ms-python.python'],
            {
                encoding: 'utf-8',
                stdio: 'inherit'
            }
        );

        // Download VS Code, unzip it and run the integration test
        await runTests({launchArgs, extensionDevelopmentPath, extensionTestsPath});
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
