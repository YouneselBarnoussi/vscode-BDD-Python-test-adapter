import * as assert from 'assert';
import * as vscode from 'vscode';
import { parseTestSuites } from '../../loadTests';

suite('loadTests.ts', () => {
	vscode.window.showInformationMessage('Start loadTest tests.');

	test('It parses a test suite', async () => {
        const controller = vscode.tests.createTestController('load-test-controller', 'Controller used in testing load tests');

        const output = `
        Feature: Print functionality # features/print.feature:4
        The printer can place documents in a Queue and print them one by one
        Scenario: The printer can add documents to the queue  # features/print.feature:7
            Given a printer in operating mode                   # features/steps/step_definitions.py:10
            When I create a temporary file named 'temp.txt'     # features/steps/step_definitions.py:18
            And I add the 'temp.txt' file to the printer queue  # features/steps/step_definitions.py:40
            Then the printer queue length is '1'                # features/steps/step_definitions.py:49
        Scenario Outline: The printer will go in Error state when an invalid document is provided -- @1.1   # features/print.feature:20   
            Given a printer in operating mode                                                                 # features/steps/step_definitions.py:10
            When I create an invalid file named 'no_extension'                                                # features/steps/step_definitions.py:30
            And I add the 'no_extension' file to the printer queue                                            # features/steps/step_definitions.py:40
            Then the printer is in 'ERROR' state                                                              # features/steps/step_definitions.py:57
        `;

        const tests = await parseTestSuites(controller, output, __dirname + '/support');

		assert.strictEqual(
			tests.length,
            1
		);
		assert.strictEqual(
			tests[0].children.size,
            2
		);

        assert.strictEqual(
            tests[0].label,
            'Print functionality'
        );

        assert.strictEqual(
            tests[0].children.get('The printer can add documents to the queue') !== undefined,
            true,
        );

        assert.strictEqual(
            tests[0].children.get('The printer will go in Error state when an invalid document is provided') !== undefined,
            true,
        );
	});
});