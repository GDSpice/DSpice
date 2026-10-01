const vscode = require('vscode');
const SymbolsSync = require('./symbolsSync');
const LibrarySync = require('./librarySync');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class DSpiceEditorProvider {
    constructor(context, viewType, fileType) {
        this.context = context;
        this.viewType = viewType;
        this.fileType = fileType;
    }

    static register(context, viewType, fileType) {
        const provider = new DSpiceEditorProvider(context, viewType, fileType);
        return vscode.window.registerCustomEditorProvider(
            viewType,
            provider,
            {
                webviewOptions: { retainContextWhenHidden: true },
                supportsMultipleEditorsPerDocument: false
            }
        );
    }

    async resolveCustomTextEditor(document, webviewPanel, token) {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media')
            ]
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        DSpiceEditorProvider.activeWebview = webviewPanel.webview;

        webviewPanel.onDidChangeViewState(e => {
    if (e.webviewPanel.active) {
        DSpiceEditorProvider.activeWebview = webviewPanel.webview;
    }
});

        // Send the current content (on initial load or Undo/Redo)
        const sendContent = (text) => {
            webviewPanel.webview.postMessage({
                type: 'update',
                content: text,
                fileType: this.fileType
            });
        };

        // Function to extract the filename without its path or extension
        function getFileName() {
            return path.basename(document.fileName, path.extname(document.fileName));
        }

        // Function to send the filename to the Webview
        const sendFileName = () => {
            webviewPanel.webview.postMessage({
                type: 'setFileName',
                fileName: getFileName()
            });
        };



        // When "ready" is received from the Webview
        const msgDisposable = webviewPanel.webview.onDidReceiveMessage(async message => {
            switch (message.type) {
                case 'contentChanged':
                case 'save':
                    this.applyContentChange(document, message.content);
                    break;
case 'ready':
    sendContent(document.getText());
    sendFileName(); //Send the filename when the Webview is ready
    break;

                case 'copyData':
                    await vscode.env.clipboard.writeText(message.data);
                    break;
case 'getLibraryFiles':
    try {
        const libFiles = LibrarySync.getLibraryFiles(this.context.extensionPath);
        webviewPanel.webview.postMessage({
            type: 'libraryFilesResult',
            libFiles: libFiles
        });
    } catch (err) {
        webviewPanel.webview.postMessage({
            type: 'libraryFilesResult',
            libFiles: [],
            error: err.message
        });
    }
    break;

case 'getSpiceModels':
    try {
        const filePath = message.filePath;
        const result = LibrarySync.getSpiceModels(filePath);
        webviewPanel.webview.postMessage({
            type: 'spiceModelsResult',
            rawContent: result.rawContent,
            models: result.models,
            subckts: result.subckts,
            error: result.error || null
        });
    } catch (err) {
        webviewPanel.webview.postMessage({
            type: 'spiceModelsResult',
            rawContent: '',
            models: [],
            subckts: [],
            error: err.message
        });
    }
    break;

case 'execOp':
    try {
        const spiceCode = message.code;
        const tempDir = os.tmpdir();
        const circuitFile = path.join(tempDir, `circuit_${Date.now()}.cir`);
        
        // write the spice code to a temporary file
        fs.writeFileSync(circuitFile, spiceCode, 'utf-8');
        
        let ngspicePath = path.join(this.context.extensionPath, 'ngspice', 'bin', 'ngspice_con.exe');
        
        const ngspiceProcess = spawn(ngspicePath, ['-b', circuitFile], {
            cwd: tempDir,
            env: { ...process.env, PATH: path.dirname(ngspicePath) + path.delimiter + process.env.PATH }
        });
        
        let stdout = '';
        let stderr = '';
        
        ngspiceProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        ngspiceProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        ngspiceProcess.on('close', (code) => {
            // delete the temporary circuit file after execution
            try { fs.unlinkSync(circuitFile); } catch (err) {}
            
            const results = parseSpiceResults_(stdout, stderr);
            
            webviewPanel.webview.postMessage({
                type: 'execOpResult',
                success: true,
                data: {
                    success: code === 0,
                    exitCode: code,
                    stdout: stdout,
                    stderr: stderr,
                    results: results,
                    rawOutput: stdout + '\n' + stderr
                }
            });
        });
        
        ngspiceProcess.on('error', (error) => {
            try { fs.unlinkSync(circuitFile); } catch (err) {}
            
            webviewPanel.webview.postMessage({
                type: 'execOpResult',
                success: false,
                error: 'Failed to start ngspice: ' + error.message
            });
        });
        
    } catch (error) {
        webviewPanel.webview.postMessage({
            type: 'execOpResult',
            success: false,
            error: error.message
        });
    }
    break;
                
 //*****************Analysis Start **************************/   
case 'startSimulation':
    try {
        const spiceCode = message.code;
        const tempDir = os.tmpdir();
        const circuitFile = path.join(tempDir, `circuit_${Date.now()}.cir`);
        const resultsFile = path.join(tempDir, 'results.txt');
        
        // Detect analysis type
        const analysisType = detectAnalysisType(spiceCode);
        
        // Write circuit file
        fs.writeFileSync(circuitFile, spiceCode, 'utf-8');
        
        // Kill previous process if exists
        if (this.ngspiceProcess) {
            console.log("Stopping previous ngspice process...");
            this.ngspiceProcess.kill();
            this.ngspiceProcess = null;
        }
        
        const ngspicePath = path.join(this.context.extensionPath, 'ngspice', 'bin', 'ngspice_con.exe');
        
        this.ngspiceProcess = spawn(ngspicePath, ['-b', circuitFile], {
            cwd: tempDir,
            env: { ...process.env, PATH: path.dirname(ngspicePath) + path.delimiter + process.env.PATH }
        });
        
        let stdout = '';
        let stderr = '';
        let progressInterval = null;
        let progress = 0;
        const startTime = Date.now();
        
        // Send initial progress
        webviewPanel.webview.postMessage({
            type: 'simulationProgress',
            progress: 0
        });
        
        webviewPanel.webview.postMessage({
            type: 'simulationLog',
            message: 'Starting ngspice simulation...',
            logType: 'info'
        });
        
        // Simulate progress updates
        progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 5;
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                
                webviewPanel.webview.postMessage({
                    type: 'simulationProgress',
                    progress: Math.min(90, progress),
                    elapsedTime: minutes + ':' + (seconds < 10 ? '0' : '') + seconds
                });
            }
        }, 500);
        
        this.ngspiceProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        this.ngspiceProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        this.ngspiceProcess.on('close', (code) => {
            clearInterval(progressInterval);
            
            // Read results file if exists
            let resultsContent = '';
            try {
                if (fs.existsSync(resultsFile)) {
                    resultsContent = fs.readFileSync(resultsFile, 'utf-8');
                }
            } catch (err) {}
            
            // Cleanup temp files
            try {
                fs.unlinkSync(circuitFile);
                if (fs.existsSync(resultsFile)) fs.unlinkSync(resultsFile);
            } catch (err) {}
            
            // Parse results
            const results = parseSpiceResults(stdout, stderr, resultsContent, analysisType);
            
            this.solveData = {
                success: code === 0,
                exitCode: code,
                stdout: stdout,
                stderr: stderr,
                results: results,
                rawOutput: stdout + '\n' + stderr
            };
            
            // Send completion
            webviewPanel.webview.postMessage({
                type: 'simulationProgress',
                progress: 100,
                elapsedTime: 'Done'
            });
            
            webviewPanel.webview.postMessage({
                type: 'simulationComplete',
                data: {
                    stdout: stdout,
                    stderr: stderr,
                    results: results
                }
            });
            
            this.ngspiceProcess = null;
        });
        
        this.ngspiceProcess.on('error', (error) => {
            clearInterval(progressInterval);
            
            try { fs.unlinkSync(circuitFile); } catch (err) {}
            
            this.solveData = {
                success: false,
                error: error.message,
                message: 'Failed to start ngspice. Please check the path: ' + ngspicePath
            };
            
            webviewPanel.webview.postMessage({
                type: 'simulationError',
                error: error.message
            });
            
            this.ngspiceProcess = null;
        });
        
    } catch (error) {
        webviewPanel.webview.postMessage({
            type: 'simulationError',
            error: error.message
        });
    }
    break;

case 'stopSimulation':
    if (this.ngspiceProcess) {
        console.log("Stopping ngspice process...");
        this.ngspiceProcess.kill();
        this.ngspiceProcess = null;
        
        webviewPanel.webview.postMessage({
            type: 'simulationProgress',
            progress: 0,
            elapsedTime: 'Stopped'
        });
        
        webviewPanel.webview.postMessage({
            type: 'simulationLog',
            message: 'Simulation stopped by user',
            logType: 'warn'
        });
    }
    break;


case 'getSimulationResults':
    webviewPanel.webview.postMessage({
        type: 'simulationResults',
        data: this.solveData || null
    });
    break;



 //****************Analysis End ******************************//
    
    
    
    case 'updateDataSymbols':
                   const result =  await SymbolsSync.sync(document, this.context);
                if (result && DSpiceEditorProvider.activeWebview) {
                   DSpiceEditorProvider.activeWebview.postMessage({
                      type: 'symbolsDataUpdated',
                     data: result
                    }); }
                    break;

                    case 'readSymFiles':
  
    const extPath = this.context.extensionPath;
    const symbolsDir = path.join(extPath, 'symbols');
    const targetDir = path.join(symbolsDir, message.dir);
    
    const contents = [];
    if (message.files && Array.isArray(message.files)) {
        for (const file of message.files) {
            const filePath = path.join(targetDir, file);
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                contents.push(data);
            } catch (e) {
                console.error('❌ Error reading', filePath, e);
                contents.push(null);
            }
        }
    }
    
    webviewPanel.webview.postMessage({
        type: 'symFilesContent',
        contents: contents
    });
    break;

    case 'readSymFilesFromWorkSpace':
    const allContents = [];
    
    if (vscode.workspace.workspaceFolders) {
        for (const folder of vscode.workspace.workspaceFolders) {
            const folderPath = folder.uri.fsPath;
            
            // Recursive function to scan directories for .sym files
            function scanDir(dirPath) {
                if (!fs.existsSync(dirPath)) return;
                const entries = fs.readdirSync(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    if (entry.isDirectory()) {
                        scanDir(fullPath); // Recursively scan subdirectory
                    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.sym')) {
                        try {
                            const data = fs.readFileSync(fullPath, 'utf8');
                            allContents.push(data);
                        } catch (e) {
                            console.error('❌ Error reading', fullPath, e);
                            allContents.push(null);
                        }
                    }
                }
            }
            
            scanDir(folderPath);
        }
    }
    
    webviewPanel.webview.postMessage({
        type: 'symFilesFromWorkSpaceContent',
        contents: allContents
    });
    break;
            }
        });

        //Listen for Undo/Redo and VS Code changes
        const docDisposable = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                sendContent(e.document.getText());
            }
        });

webviewPanel.onDidDispose(() => {
    msgDisposable.dispose();
    docDisposable.dispose();
    
    if (DSpiceEditorProvider.activeWebview === webviewPanel.webview) {
        DSpiceEditorProvider.activeWebview = null;
    }
});
    }

    async applyContentChange(document, content) {
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        edit.replace(document.uri, fullRange, content);
         await vscode.workspace.applyEdit(edit);
   
    }

    getHtmlForWebview(webview) {
        const nonce = getNonce();

        const mediaPath = vscode.Uri.joinPath(this.context.extensionUri, 'media');
        const cadPath = vscode.Uri.joinPath(mediaPath,'cad');
        const dialogPath = vscode.Uri.joinPath(mediaPath,'dialog');

        // Define all variables correctly
        const rulerJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'ruler.js'));
        const gridJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'grid.js'));
        const bodyJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'body.js'));
        const shapesJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'shapes.js'));
        const resizeJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'resize.js'));
        const designeJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'designe.js'));
        const listSymbolJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'listSymbol.js'));
        const sh01Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'information.js'));
        const sh02Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'polyline.js'));
        const sh03Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'arc.js'));
        const sh04Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'pin.js'));
        const sh05Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'ioparam.js'));
        const sh06Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'part.js'));
        const sh07Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'net.js'));
        const sh08Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'text.js'));
        const sh09Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'body.js'));
        const sh10Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'toolButton.js'));
        const sh11Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'cursor.js'));
        const sh12Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'controle.js'));
        const sh13Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'cnode.js'));
        const sh14Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'utility.js'));
        const sh15Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'measurement.js'));
        const sh16Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'svg.js'));
        const sh17Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'analysis.js'));
        const sh18Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'plots.js'));
        const sh19Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'codePy.js'));
        const sh20Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'codeHtml.js'));
        const sh21Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'codeSpice.js'));
        const sh22Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'port.js'));
        const sh23Js= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'shapes', 'vbar.js'));
        const selectElementsJs= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'selectElements.js'));
        const simulationJs= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'simulation.js'));
        const propertiesPanelJs = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath,'properties', 'propertiesDialog.js'));
        const propertiesBuilderJs = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath,'properties', 'propertiesBuilder.js'));
        const propertiesRouterJs = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath,'properties', 'propertiesRouter.js'));
        const symbolsPanelJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'symbolsPanel.js'));
        const signalDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'signalDialog.js'));
        const elementDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'elementDialog.js'));
        const listModelsDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'listModelsDialog.js'));
        const codeEditorDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'codeEditorDialog.js'));
        const spiceNetlistDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'spiceNetlistDialog.js'));
        const processAnalysisDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'processAnalysisDialog.js'));
        const messageDialogJs =  webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'messageDialog.js'));
        const opAnalysisDialogJs = webview.asWebviewUri(vscode.Uri.joinPath(dialogPath, 'opAnalysisDialog.js'));
        const drawingJs = webview.asWebviewUri(vscode.Uri.joinPath(cadPath, 'drawing.js'));
        const stdJs= webview.asWebviewUri(vscode.Uri.joinPath(cadPath,'std.js'));
        const plotlyJs =webview.asWebviewUri(vscode.Uri.joinPath(mediaPath,'pack','plotly-latest.min.js'));
        const htmlCodeCss = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'css', 'HTMLcode.css'));
    
        // Define the library path for ngspice
        const libraryPath = path.join(this.context.extensionPath, 'library');
        const extensionPath = this.context.extensionPath;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const workspacePath = workspaceFolder ? workspaceFolder.uri.fsPath : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSpice Editor</title>
    <link href="${htmlCodeCss}" rel="stylesheet">
    <style>
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; font-family: verdana; }
        #content { width: 100%; height: 100%; position: relative; }
    </style>

    <script nonce="${nonce}">
       //define global variables for extension and workspace paths
        window.extensionPath = ${JSON.stringify(extensionPath)};
        window.libraryPath = ${JSON.stringify(libraryPath)};
        window.workspacePath = ${JSON.stringify(workspacePath)}; 
    </script>
</head>
<body>
    <div id="content"></div>


    <script nonce="${nonce}" src="${sh01Js}"></script>
    <script nonce="${nonce}" src="${sh02Js}"></script>
    <script nonce="${nonce}" src="${sh03Js}"></script>
    <script nonce="${nonce}" src="${sh04Js}"></script>
    <script nonce="${nonce}" src="${sh05Js}"></script>
    <script nonce="${nonce}" src="${sh06Js}"></script>
    <script nonce="${nonce}" src="${sh07Js}"></script>
    <script nonce="${nonce}" src="${sh08Js}"></script>
    <script nonce="${nonce}" src="${sh09Js}"></script>
    <script nonce="${nonce}" src="${sh10Js}"></script>
    <script nonce="${nonce}" src="${sh11Js}"></script>
    <script nonce="${nonce}" src="${sh12Js}"></script>
    <script nonce="${nonce}" src="${sh13Js}"></script>
    <script nonce="${nonce}" src="${sh14Js}"></script>
    <script nonce="${nonce}" src="${sh15Js}"></script>
    <script nonce="${nonce}" src="${sh16Js}"></script>
    <script nonce="${nonce}" src="${sh17Js}"></script>
    <script nonce="${nonce}" src="${sh18Js}"></script>
    <script nonce="${nonce}" src="${sh19Js}"></script>
    <script nonce="${nonce}" src="${sh20Js}"></script>
    <script nonce="${nonce}" src="${sh21Js}"></script>
    <script nonce="${nonce}" src="${sh22Js}"></script>
    <script nonce="${nonce}" src="${sh23Js}"></script>
    <script nonce="${nonce}" src="${propertiesPanelJs}"></script>
    <script nonce="${nonce}" src="${selectElementsJs}"></script>
    <script nonce="${nonce}" src="${propertiesBuilderJs}"></script>
    <script nonce="${nonce}" src="${propertiesRouterJs}"></script>
    <script nonce="${nonce}" src="${symbolsPanelJs}"></script>
    <script nonce="${nonce}" src="${signalDialogJs}"></script>
    <script nonce="${nonce}" src="${elementDialogJs}"></script>
    <script nonce="${nonce}" src="${listModelsDialogJs}"></script>
    <script nonce="${nonce}" src="${codeEditorDialogJs}"></script>
    <script nonce="${nonce}" src="${spiceNetlistDialogJs}"></script>
    <script nonce="${nonce}" src="${processAnalysisDialogJs}"></script>
    <script nonce="${nonce}" src="${messageDialogJs}"></script> 
    <script nonce="${nonce}" src="${opAnalysisDialogJs}"></script>  
    <script nonce="${nonce}" src="${rulerJs}"></script>
    <script nonce="${nonce}" src="${gridJs}"></script>
    <script nonce="${nonce}" src="${bodyJs}"></script>
    <script nonce="${nonce}" src="${designeJs}"></script>
    <script nonce="${nonce}" src="${shapesJs}"></script>
    <script nonce="${nonce}" src="${resizeJs}"></script>
    <script nonce="${nonce}" src="${listSymbolJs}"></script>
    <script nonce="${nonce}" src="${simulationJs}"></script>
    <script nonce="${nonce}" src="${drawingJs}"></script>
    <script nonce="${nonce}" src="${stdJs}"></script>
    <script nonce="${nonce}" src="${plotlyJs}"></script>
    


    
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        // Receive updates from VS Code (including Undo/Redo)
        window.addEventListener('message', event => {
            const msg = event.data;
            console.log('Message from VS Code:', msg.type);

            if (msg.type === 'load' || msg.type === 'update') {

                window.fileContent = msg.content;
                window.fileType = msg.fileType;


               if (typeof drawing !== 'undefined' && drawing.pendingSave) {
                    console.log('Ignoring update (pending save)');
                    drawing.pendingSave = false;
                    return;
                }
                
                if (typeof drawing !== 'undefined') {
                    drawing.setFileType(window.fileType);
                    drawing.setSymbol(window.fileContent);
                    
                }
            }
            else if (msg.type === 'symbolsDataUpdated') {
                  if (typeof drawing !== 'undefined' && drawing.getDataSym) {
                     drawing.getDataSym(msg.data);
                     }
             }
           else if (msg.type === 'symFilesContent') {
                if (typeof drawing !== 'undefined' && drawing._symFilesResolve) {
                    drawing._symFilesResolve(msg.contents);
                    drawing._symFilesResolve = null;
                    }
             }
          else if (msg.type === 'symFilesFromWorkSpaceContent') {
    if (typeof drawing !== 'undefined' && drawing._workspaceSymResolve) {
        drawing._workspaceSymResolve(msg.contents);
        drawing._workspaceSymResolve = null;
    }
} else if (msg.type === 'execOpResult') {
    if (typeof drawing !== 'undefined' && drawing._execOpResolve) {
        if (msg.success) {
            drawing._execOpResolve(msg.data);
        } else {
            drawing._execOpReject(msg.error);
        }
        drawing._execOpResolve = null;
        drawing._execOpReject = null;
    }
} else if (msg.type === 'simulationResults') {
    if (typeof drawing !== 'undefined' && drawing.handleSimulationResults) {
        drawing.handleSimulationResults(msg.data);
    }
}
// Execute copy, cut, and paste commands
            if (msg.type === 'execCopy') {
                 drawing.copy();
            }
            if (msg.type === 'execCut') {
                 drawing.cut();
            }
            if (msg.type === 'execPaste') {
                 drawing.paste(msg.data);
            }
// Receive the file name from VS Code and update drawing.fileName
    if (msg.type === 'setFileName') {
        drawing.fileName = msg.fileName;
        drawing.symbol.name = msg.fileName; // Update the symbol name as well
        console.log('File name updated to:', drawing.fileName);
    }
           
        });

        // Notify VS Code that the Webview is ready
        vscode.postMessage({ type: 'ready' });
    </script>
    
</body>
</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function parseSpiceResults_(stdout, stderr) {
    const results = {
        results: [],
        errors: [],
        warnings: []
    };

    const combinedOutput = stdout + '\n' + stderr;
    const lines = combinedOutput.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
            results.errors.push(trimmed);
        }
        if (trimmed.toLowerCase().includes('warning')) {
            results.warnings.push(trimmed);
        }
    }

    const allText = combinedOutput;

    // v(node) = value  أو  i(component) = value
    const viPattern = /([vi])\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
    let match;
    while ((match = viPattern.exec(allText)) !== null) {
        const type = match[1].toLowerCase();
        const name = match[2].trim();
        const value = parseFloat(match[3]);
        results.results.push({
            name: `${type}(${name})`,
            value: value,
            formatted: formatValue(value)
        });
    }

    // جدول: node_name   value
    const tablePattern = /^\s*([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)\s*$/gim;
    while ((match = tablePattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        if (!results.results.find(r => r.name === name)) {
            results.results.push({ name, value, formatted: formatValue(value) });
        }
    }

    // print output
    const printPattern = /^\s*([a-z][a-z0-9_]*)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)\s*$/gim;
    while ((match = printPattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        if (!results.results.find(r => r.name === name)) {
            results.results.push({ name, value, formatted: formatValue(value) });
        }
    }

    return results;
}

function formatValue(value) {
    const absVal = Math.abs(value);
    if (absVal === 0) return '0';
    if (absVal >= 1e9) return (value / 1e9).toFixed(3) + ' G';
    if (absVal >= 1e6) return (value / 1e6).toFixed(3) + ' M';
    if (absVal >= 1e3) return (value / 1e3).toFixed(3) + ' k';
    if (absVal >= 1) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    if (absVal >= 1e-3) return (value * 1e3).toFixed(3) + ' m';
    if (absVal >= 1e-6) return (value * 1e6).toFixed(3) + ' µ';
    if (absVal >= 1e-9) return (value * 1e9).toFixed(3) + ' n';
    if (absVal >= 1e-12) return (value * 1e12).toFixed(3) + ' p';
    return value.toExponential(3);
}


// Helper: Detect analysis type
function detectAnalysisType(code) {
    if (/\.tran\s+/i.test(code)) return 'tran';
    if (/\.op\s*$/im.test(code)) return 'op';
    if (/\.dc\s+/i.test(code)) return 'dc';
    if (/\.ac\s+/i.test(code)) return 'ac';
    return 'op';
}

// Enhanced parseSpiceResults with analysis type
function parseSpiceResults(stdout, stderr, resultsContent, analysisType) {
    const results = {
        results: [],
        errors: [],
        warnings: [],
        type: analysisType || 'op'
    };

    const combinedOutput = stdout + '\n' + stderr;
    const lines = combinedOutput.split('\n');

    // Extract errors and warnings
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
            results.errors.push(trimmed);
        }
        if (trimmed.toLowerCase().includes('warning')) {
            results.warnings.push(trimmed);
        }
    }

    // Parse results.txt if exists
    if (resultsContent && resultsContent.trim()) {
        const cleanContent = resultsContent.replace(/\f/g, '\n');
        const contentLines = cleanContent.split('\n');

        const hasTableHeader = contentLines.some(l => 
            l.includes('Index') && (
                l.includes('time') || 
                l.includes('v-sweep') || 
                l.includes('frequency') ||
                l.includes('freq')
            )
        );

        if (hasTableHeader) {
            parseTableData(contentLines, results);
        } else {
            parseOpData(contentLines, results);
        }
        return results;
    }

    // Fallback: parse stdout
    parseStdoutData(combinedOutput, results);
    return results;
}

function parseTableData(contentLines, results) {
    let varNames = [];
    let xAxisName = 'x';
    let dataRows = [];
    let inDataSection = false;

    for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i].trim();
        if (!line) continue;

        if (line.includes('---') || line.includes('Analysis') || line.includes('Index')) {
            if (line.includes('Index')) {
                const parts = line.split(/\s+/).filter(p => p && p !== 'Index');
                if (parts.length > 0) {
                    xAxisName = parts[0];
                    varNames = parts.slice(1);
                }
            }
            inDataSection = true;
            continue;
        }

        if (inDataSection) {
            const parts = line.split(/\s+/).filter(p => p);
            if (parts.length >= 3 && !isNaN(parseFloat(parts[0]))) {
                dataRows.push(parts);
            }
        }
    }

    for (let colIdx = 0; colIdx < varNames.length; colIdx++) {
        const list = [];
        for (const row of dataRows) {
            const x = parseFloat(row[1]);
            const value = parseFloat(row[colIdx + 2]);
            if (!isNaN(x) && !isNaN(value)) {
                list.push([x, value]);
            }
        }
        if (list.length > 0) {
            results.results.push({
                name: varNames[colIdx],
                data: list
            });
        }
    }
}

function parseOpData(contentLines, results) {
    for (const line of contentLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^([a-z]\([a-z0-9_]+\))\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/i);
        if (match) {
            const name = match[1];
            const value = parseFloat(match[2]);
            results.results.push({
                name: name,
                value: value,
                formatted: formatValue(value)
            });
        }
    }
}

function parseStdoutData(allText, results) {
    // v(node) = value
    const vPattern = /v\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
    let match;
    while ((match = vPattern.exec(allText)) !== null) {
        const name = match[1].trim();
        const value = parseFloat(match[2]);
        const exists = results.results.find(r => r.name === `v(${name})`);
        if (!exists) {
            results.results.push({ name: `v(${name})`, value: value, formatted: formatValue(value) });
        }
    }

    // Node Voltage table
    const nodeTablePattern = /Node\s+Voltage[\s\S]*?----\s*\n\s*----\s*-------\n([\s\S]*?)(?=\n\s*Source|$)/i;
    const nodeTableMatch = allText.match(nodeTablePattern);
    if (nodeTableMatch) {
        const tableLines = nodeTableMatch[1].split('\n');
        for (const line of tableLines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.includes('----')) continue;
            const nodeMatch = trimmed.match(/^([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)/i);
            if (nodeMatch) {
                const name = nodeMatch[1].trim();
                const value = parseFloat(nodeMatch[2]);
                const exists = results.results.find(r => r.name === `v(${name})`);
                if (!exists) {
                    results.results.push({ name: `v(${name})`, value: value, formatted: formatValue(value) });
                }
            }
        }
    }

    // Add GND
    const hasVoltages = results.results.some(r => r.name.startsWith('v('));
    if (hasVoltages && !results.results.find(r => r.name === 'v(0)')) {
        results.results.unshift({ name: 'v(0)', value: 0, formatted: '0' });
    }
}

module.exports = DSpiceEditorProvider;

