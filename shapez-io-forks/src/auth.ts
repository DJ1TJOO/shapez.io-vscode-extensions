import * as vscode from "vscode";
import * as express from "express";
import * as passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "./apiVariables";
import { GlobalStateMananger } from "./storage/globalState_manager";

export const auth = (): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
        const app = express();
        const server = app.listen(40875, () => {
            vscode.commands.executeCommand(
                "vscode.open",
                vscode.Uri.parse(`http://localhost:40875/auth/github`)
            );
        });
        passport.use(
            new GitHubStrategy(
                {
                    clientID: GITHUB_CLIENT_ID,
                    clientSecret: GITHUB_CLIENT_SECRET,
                    callbackURL: "http://localhost:40875/auth/github/callback",
                    scope: ["public_repo", "user:email"],
                },
                (accessToken, _refreshToken, _profile, cb) => {
                    GlobalStateMananger.setToken(accessToken);
                    cb(undefined, undefined);
                }
            )
        );
        app.use(passport.initialize());
        app.get(
            "/auth/github",
            passport.authenticate("github", { session: false })
        );
        app.get(
            "/auth/github/callback",
            passport.authenticate("github", {
                session: false,
                failureRedirect: "/auth/github/failure",
            }),
            (_req, res) => {
                res.redirect("vscode:");
                server.close();
                resolve(GlobalStateMananger.getToken());
            }
        );
        app.get("/auth/github/failure", (_req, res) => {
            res.redirect("vscode:");
            server.close();
            reject(undefined);
        });
    });
};
