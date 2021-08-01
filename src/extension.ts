import * as vscode from "vscode";

const defaultURL = "http://localhost:8177/";

function makeViewer(url: string = defaultURL) {
  const panel = vscode.window.createWebviewPanel(
    "remplViewer",
    "Rempl Viewer",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = getWebviewContent(url);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("rempl-host-vscode.connect", () => {
      makeViewer();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("rempl-host-vscode.connectCustom", () => {
      const url = vscode.window.showInputBox({
        title: "Rempl Connection Config",
        prompt: "Server URL",
        value: "http://",
      });
      url.then((url) => {
        if (url != null) {
          makeViewer(url);
        }
      });
    })
  );
}

function getWebviewContent(url: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <style>
	    *, html, body {
			margin: 0;
			padding: 0;
		}

		#mainFrame {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			border: none;
		}
	  </style>
  </head>
  <body>
	  <iframe width="100%" height="100%" id="mainFrame" src="${url}"/>
  </body>
  </html>`;
}

export function deactivate() {}
