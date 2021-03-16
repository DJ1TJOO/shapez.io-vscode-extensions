import { GlobalStateMananger } from "./storage/globalState_manager";
import * as vscode from "vscode";
import { auth } from "./auth";
import { Forks } from "./forks";
import { Tester } from "./tester";

export function activate(context: vscode.ExtensionContext) {
    GlobalStateMananger.globalState = context.globalState;
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
    context.subscriptions.push(
        vscode.commands.registerCommand("shapez-io-forks.forks", () => {
            new Forks(context.extensionUri, "https://shapez.io");
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand("shapez-io-forks.auth", () => {
            auth();
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {}
