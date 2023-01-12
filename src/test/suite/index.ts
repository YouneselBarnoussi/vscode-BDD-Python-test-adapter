import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as path from 'path';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd'
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c: (value: void | PromiseLike<void>) => void, e: (reason: any) => void) => {
        glob('**/**.test.js', {cwd: testsRoot}, (err: Error | null, files: string[]) => {
            if (err) {
                return e(err);
            }

            // Add files to the test suite
            files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                // Run the mocha test
                mocha.run((failures: number) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
