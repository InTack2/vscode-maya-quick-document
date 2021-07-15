const vscode = require('vscode');

const { format } = require("util");

const open = require("open");
const request = require("request")

function open_url_to_browser(url) {
    open(url);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "maya-quick-document" is now active!');

    let disposable_2 = vscode.commands.registerCommand("maya-quick-document.show-document", function () {

        const editor = vscode.window.activeTextEditor;

        const config = vscode.workspace.getConfiguration("maya-quick-document");

        const target_language = config.get("target-language");
        const target_maya_version = config.get("use-maya-version");

        console.log(target_language);
        console.log(target_maya_version);

        if (editor) {
            const document = editor.document;

            let word = undefined;
            if (!editor.selection.isEmpty) {
                const selection = editor.selection;

                console.log("selection", selection);

                word = document.getText(selection);
            } else {
                const now_position = editor.selection.active;

                console.log(now_position);

                let hit_range = undefined;
                try {

                    hit_range = document.getWordRangeAtPosition(now_position, /[a-zA-Z0-9_]+/);

                } catch (error) {
                    console.log(error);
                }

                word = document.getText(hit_range);
            }
            console.log(word);

            const target_url = format("https://help.autodesk.com/cloudhelp/%s/%s/Maya-Tech-Docs/CommandsPython/%s.html", target_maya_version, target_language, word);

            console.log("target_url", target_url);

            request.get(
                { url: target_url }, function (error, response, body) {
                    if (response.statusCode == "200") {
                        open_url_to_browser(target_url);
                    } else {
                        vscode.window.showWarningMessage(format('not found "%s" command', word));
                    }
                }
            );

            // vscode.window.showInformationMessage(word);

        }
    });

    // context.subscriptions.push(disposable);
    context.subscriptions.push(disposable_2);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
