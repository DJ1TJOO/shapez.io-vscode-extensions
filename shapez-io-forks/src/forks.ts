import { StorageMananger } from "./storage/storage_manager";
import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as GitHub from "octonode";
import { GlobalStateMananger } from "./storage/globalState_manager";
import { auth } from "./auth";

export class Forks {
    _extensionUri;

    constructor(_extensionUri: vscode.Uri, url: string | undefined) {
        this._extensionUri = _extensionUri;

        const webviewView = vscode.window.createWebviewPanel(
            "shapez-io-forks",
            "Shapez.io Forks",
            vscode.ViewColumn.One,
            {
                retainContextWhenHidden: true,
            }
        );

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(this._onDidReceiveMessage);
        this._getForks(webviewView);
    }

    private _onDidReceiveMessage(data: any) {
        switch (data.type) {
            case "onInfo": {
                if (!data.value) {
                    return;
                }
                vscode.window.showInformationMessage(data.value);
                break;
            }
            case "onError": {
                if (!data.value) {
                    return;
                }
                vscode.window.showErrorMessage(data.value);
                break;
            }
            case "onOpenUrl": {
                if (!data.value) {
                    return;
                }
                vscode.commands.executeCommand(
                    "vscode.open",
                    vscode.Uri.parse(data.value)
                );
                break;
            }
        }
    }

    private async _getForks(webviewView: vscode.WebviewPanel) {
        let token: string | undefined = GlobalStateMananger.getToken();
        if (!token)
            if (!(token = await auth())) {
                webviewView.dispose();
                return vscode.window.showErrorMessage("GitHub token not found");
            }

        if (StorageMananger.getForks().length <= 0) {
            const client = GitHub.client(token);
            const repo = client.repo("tobspr/shapez.io");
            StorageMananger.getForksFromRepo(repo)
                .then(({ err, data }) => {
                    StorageMananger.setForks(data);
                    webviewView.webview.postMessage({
                        type: "onForks",
                        value: data,
                    });
                })
                .catch(({ err, data }) => {
                    vscode.window.showErrorMessage(err);
                });
        } else {
            webviewView.webview.postMessage({
                type: "onForks",
                value: StorageMananger.getForks(),
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this._extensionUri,
                "out",
                "compiled",
                "forks.js"
            )
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "forks.css")
        );
        const loadUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "loading.svg")
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible Content-Security-Policy" content="default-src script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" href="${styleUri}">
            <style>
                .prefab_LoadingTextWithAnim::after,
                .prefab_LoadingTextWithAnimDelayed::after {
                    background: url("${loadUri}") center center / contain no-repeat;
                }
            </style>
            <script nonce="${nonce}">
                const tsvscode = acquireVsCodeApi();
            </script>
        </head>
        <body>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
