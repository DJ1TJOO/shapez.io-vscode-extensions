import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import * as GitHub from "octonode";
import { gitUser, gitPass } from "./apiVariables";

async function getForks(
    repo: any,
    page: number | undefined = undefined
): Promise<any> {
    const promise = new Promise((resolve: (value: any) => void, reject) => {
        repo.forks(
            { per_page: 100, page: page ? page : 0 },
            (err: any, body: any[], header: any) => {
                if (err) return reject({ err: err, data: null });
                if (body.length > 99) {
                    const p = new Promise(
                        (resolve: (value: any) => void, reject) => {
                            getForks(repo, page ? page + 1 : 1)
                                .then(({ err, data }) => {
                                    resolve({ err: null, data: data });
                                })
                                .catch(({ err, forks }) => {
                                    reject({ err: err, data: null });
                                });
                        }
                    );
                    p.then((newForks) => {
                        resolve({ err: null, data: [...body, ...newForks] });
                    });
                } else resolve({ err: null, data: body });
            }
        );
    });
    return promise;
}

export class Forks {
    _extensionUri;
    _view;

    constructor(_extensionUri: vscode.Uri, url: string | undefined) {
        this._extensionUri = _extensionUri;
        //TODO: auth
        GitHub.auth.config({
            username: gitUser,
            password: gitPass,
        });

        const client = GitHub.client();
        const repo = client.repo("tobspr/shapez.io");

        getForks(repo)
            .then(({ err, forks }) => {
                console.log(forks);
            })
            .catch(({ err, forks }) => {
                console.log(err);
            });

        const webviewView = vscode.window.createWebviewPanel(
            "shapez-io-forks",
            "Shapez.io Forks",
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
                "forks.js"
            )
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "forks.css")
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
