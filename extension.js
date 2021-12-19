const vscode = require('vscode');

const { format } = require("util");

const open = require("open");
const request = require("request")

function open_url_to_browser(url) {
    open(url);
}

function create_template_html(body){
    let body_data = body;
    return `<!DOCTYPE html>
    <html lang="jp">
    <style type="text/css">
    <!--
    body {background-color:white; color: black;}
    code {color: black;}
    -->
    </style>
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none';"/>
        <title>Example Webview</title>
      </head>
      <body>
      ${body_data}
      </body>
    </html> `
}
function open_url_to_web_view(current_panel, body){
    if (current_panel.panel){
        current_panel.panel.dispose();
        current_panel.panel = undefined;
    }
    current_panel.panel = vscode.window.createWebviewPanel(
        "MayaQuick",
        "Maya Quick Document",
        {
            viewColumn: vscode.ViewColumn.Two,
            preserveFocus: true
        },
        {
            enableScripts: true,
            // retainContextWhenHidden: true,
            enableCommandUris: true,
            enableFindWidget: true,
        }
    )
    let sample = create_template_html(body)
    current_panel.panel.webview.html = sample;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "maya-quick-document" is now active!');
    let current_panel = {panel: undefined};

    let disposable_2 = vscode.commands.registerCommand("maya-quick-document.show-document", function () {
        const editor = vscode.window.activeTextEditor;

        // config
        const config = vscode.workspace.getConfiguration("maya-quick-document");
        const target_language = config.get("target-language");
        const target_maya_version = config.get("use-maya-version");
        const target_open_type = config.get("open-type");

        console.log(target_language);
        console.log(target_maya_version);
        console.log(target_open_type);

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
                        if (target_open_type == "browser"){
                            open_url_to_browser(target_url);
                        }else{
                            open_url_to_web_view(current_panel, body)
                            current_panel.panel.onDidDispose(
                                () => {
                                  current_panel.panel = undefined;
                                },
                                null,
                                context.subscriptions
                              );
                        }
                    } else {
                        vscode.window.showWarningMessage(format('not found "%s" command', word));
                    }
                }
            );
        }
    });
    context.subscriptions.push(disposable_2);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
