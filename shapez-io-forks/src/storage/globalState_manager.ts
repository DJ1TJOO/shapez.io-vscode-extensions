import * as vscode from "vscode";

const TOKEN_KEY = "shapez-io-forks:token";

export class GlobalStateMananger {
    static globalState: vscode.Memento;

    static setToken(token: string) {
        return this.globalState.update(TOKEN_KEY, token);
    }

    static getToken(): string | undefined {
        return this.globalState.get(TOKEN_KEY);
    }
}
