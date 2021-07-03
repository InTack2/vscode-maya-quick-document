// モジュール'vscode'には、VS Codeの拡張性APIが含まれています。
// このモジュールをインポートして、以下のコードで vscode というエイリアスで参照します。
const vscode = require('vscode');

const { format } = require("util");

const open = require("open");
const request = require("request")

function open_url_to_browser(url) {
    open(url);
}


// このメソッドは、拡張機能が起動したときに呼び出されます。
// コマンドが初めて実行されたときに、拡張機能が有効になります。
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // コンソールを使用して、診断情報 (console.log) およびエラー (console.error) を出力します。
    // この行のコードは、拡張機能が有効になったときに一度だけ実行されます
    console.log('Congratulations, your extension "maya-quick-document" is now active!');

    // コマンドは package.json ファイルで定義されています。
    // 次に、コマンドの実装を registerCommand で提供します。
    // commandIdパラメータはpackage.jsonのcommandフィールドと一致しなければなりません。
    // let disposable = vscode.commands.registerCommand('maya-quick-document.helloWorld', function () {
    // 	// ここに配置したコードは、コマンドが実行されるたびに実行される

    // 	// ユーザーにメッセージボックスを表示する
    // 	vscode.window.showInformationMessage('Hello World from maya-quick-document!');
    // });

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
                const position = new vscode.Position(now_position.line, 0);

                console.log(now_position);
                console.log(position);

                const target_range = new vscode.Range(position, now_position);
                let hit_range = undefined;

                try {
                    hit_range = document.getWordRangeAtPosition(now_position, /[a-zA-Z0-9_]+/);
                    // const hit_range = document.getWordRangeAtPosition(target_range, /[a-zA-Z0-9_]+/);
                } catch (error) {
                    console.log(error);
                }

                word = document.getText(hit_range);
            }
            console.log(word);

            const target_url = format("https://help.autodesk.com/cloudhelp/%s/%s/Maya-Tech-Docs/Commands/%s.html", target_maya_version, target_language, word);

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

// このメソッドは、エクステンションが非アクティブになったときに呼び出されます。
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
