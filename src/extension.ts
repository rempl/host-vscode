import * as http from "http";
import * as vscode from "vscode";

function makeViewer(url: string) {
  const panel = vscode.window.createWebviewPanel(
    "remplViewer",
    "Rempl Viewer",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  getWebviewContent(panel, url);
}

export function activate(context: vscode.ExtensionContext) {
  let config = vscode.workspace.getConfiguration("rempl-host-vscode");

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("rempl-host-vscode.connect.defaultServer")) {
      config = vscode.workspace.getConfiguration("rempl-host-vscode");
    }
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("rempl-host-vscode.connect", () => {
      makeViewer(config.get<string>("connect.defaultServer")!);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("rempl-host-vscode.connectCustom", () => {
      const url = vscode.window.showInputBox({
        title: "Rempl Connection Config",
        prompt: "Server URL",
        value: config.get<string>("connect.defaultServer")!,
      });
      url.then((url) => {
        if (url) {
          makeViewer(url);
        }
      });
    })
  );
}

function getWebviewContent(panel: vscode.WebviewPanel, url: string) {
  panel.webview.html = getHTMLWithLoyout(`Loading`);

  const request = http
    .get(url, (res) => {
      if (res.statusCode && res.statusCode < 400) {
        panel.webview.html = getHTMLWithLoyout(
          `<iframe width="100%" height="100%" id="mainFrame" src="${url}"/>`,
          `
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
		  `
        );
      } else {
        panel.webview.html = getHTMLWithLoyout(
          `Rempl Server "${url}" is not available`
        );
      }
    })
    .on("error", (e) => {
      panel.webview.html = getHTMLWithLoyout(
        `Rempl Server "${url}" is not available`
      );
    });
}

export function deactivate() {}

function getHTMLWithLoyout(body: string, head: string = "") {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <style>
	    *, html, body {
			margin: 0;
			padding: 0;
			font-family: Helvetica, sans-serif;
		}

		${head}
	  </style>
  </head>
  <body>
	  ${body}
  </body>
  </html>`;
}
