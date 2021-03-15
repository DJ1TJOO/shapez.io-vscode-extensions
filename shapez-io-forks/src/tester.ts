import * as vscode from "vscode";
import { getNonce } from "./getNonce";

export class Tester {
    _extensionUri;
    _view;

    constructor(_extensionUri: vscode.Uri, url: string | undefined) {
        this._extensionUri = _extensionUri;
        const webviewView = vscode.window.createWebviewPanel(
            "shapezIOTester",
            "Shapez.io Tester",
            vscode.ViewColumn.One,
            {
                retainContextWhenHidden: true,
            }
        );

        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        if (url)
            webviewView.webview.postMessage({
                type: "url",
                data: url,
            });

        webviewView.webview.onDidReceiveMessage(async (data) => {
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
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this._extensionUri,
                "out",
                "compiled",
                "tester.js"
            )
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "tester.css")
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
        </head>
        <body>
        <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
