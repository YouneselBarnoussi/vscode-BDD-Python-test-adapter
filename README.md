# Python Behave Test Explorer for Visual Studio Code

![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/YouneselBarnoussi.vscode-behave-test-adapter)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/YouneselBarnoussi.vscode-behave-test-adapter)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/YouneselBarnoussi.vscode-behave-test-adapter)

This extension allows you to run Python [Behave](https://github.com/behave/behave) tests in the Visual Studio Code test explorer.

## Features

* Shows a Test Explorer in the Test view in VS Code's sidebar with all detected tests and suites and their state
* Adds CodeLenses to your test files for starting and debugging tests
* Shows a failed test's log when the test is selected in the explorer
* Shows step definition in feature file on ctrl+click and/or F12.

## Getting started

* Install the extension and restart VS Code
* Open the test view
* Run your tests using the run icon in the Test Explorer

If there is no python interpreter defined in Visual Studio Code the global python interpreter will be used.


https://user-images.githubusercontent.com/16510310/233095006-918a8134-bfc3-4b32-bd16-4ba396ff5ac3.mp4



## Configuration

The following configuration properties are available

| Key | Description | Default |
| ------------- |:-------------:| -----:|
| behaveTestAdapter.featuresFolderPath | The path of the features folder | ${workspaceFolder}/features
| behaveTestAdapter.enableDefintionProvider | Whether definition provider will be enabled or not | true

## Questions, issues, feature requests, and contributions

* If you have any question or a problem with the extension, please [file an issue](https://github.com/YouneselBarnoussi/vscode-BDD-Python-test-adapter/issues).
