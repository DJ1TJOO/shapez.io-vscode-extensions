import * as vscode from "vscode";
import { Forks } from "./forks";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("shapez-io-forks.helloWorld", () => {
            vscode.window.showInformationMessage(
                "Hello World from shapez.io-forks!"
            );
            new Forks();
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
