import * as vscode from "vscode";
import { Tester } from "./tester";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand("shapez-io-forks.tester", () => {
            vscode.window
                .showInputBox({
                    placeHolder: "Weblink",
                    prompt: "Leave empty for 'http://localhost:3005'",
                })
                .then((url) => {
                    new Tester(context.extensionUri, url);
                });
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
