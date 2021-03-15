import * as vscode from "vscode";
import * as path from "path";

export class Forks {
    constructor() {
        const panel = vscode.window.createWebviewPanel(
            "shapezIOForks",
            "Shapez.io Forks",
            vscode.ViewColumn.One
        );

        panel.webview.html = this.getHTMLForWebview(panel.webview);
    }

    /**
     * @returns {string}
     */
    getHTMLForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.file(path.join(__dirname, "out", "compiled", "forks.js"))
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.file(
                path.join(__dirname, "out", "compiled", "forks.css")
            )
        );

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link href="${styleUri}">
            <script src="${scriptUri}"></script>
        </head>
        <body>
        </body>
        </html>`;
    }
}
