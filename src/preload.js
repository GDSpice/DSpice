


const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFileDialog: (pageType) => ipcRenderer.invoke('open-file-dialog', pageType),
    readSymbolsFile: () => ipcRenderer.invoke('read-symbols-file'),
    getLibraryFiles: (libraryName,files) => ipcRenderer.invoke('get-library-files', libraryName,files),
    getLibraryPath: () => ipcRenderer.invoke('get-library-path'),
    showConfirmationDialog: (message) => ipcRenderer.invoke('show-confirmation-dialog', message),
    showAlert: (title, message) => ipcRenderer.send('show-alert', title, message),
    saveFile: (filename, content) => ipcRenderer.invoke('save-file', filename, content),
    saveAsFile: (filename, content, fileExtension) => ipcRenderer.invoke('save-as-file', filename, content, fileExtension),
    requestCloseIDE: (callback) => ipcRenderer.on('request-close-IDE', (event) => callback()),
    closeWindowIDE: () => ipcRenderer.send('close-window-IDE'),
    readClipboard: () => ipcRenderer.invoke('read-clipboard'),
    writeClipboard: (text) => ipcRenderer.invoke('clipboard-write', text),
    onActive: (callback) => ipcRenderer.on('window-active', () => callback()),
    //Projects management----------------------------------------------------------------------
    createFolderModels: (filename) => ipcRenderer.invoke('create-folder-Models', filename),
    getLibraryFilesFromProject: (projectFile) => ipcRenderer.invoke('get-library-files-from-project', projectFile),
    //ُEditor of python------------------------------------------------------------------------
    editText: (filePath, linePos) => ipcRenderer.invoke('edit-text', filePath, linePos),
    onSetDataSymbols: (callback) => ipcRenderer.on('set-data-symbols', (event,data) => callback(data)),
    symbolsManagement:() => ipcRenderer.invoke('symbols-management'),
    sendLibrary: (newData) => ipcRenderer.send('save-library-json', newData),
    newFileNetList: (data) => ipcRenderer.invoke('new-file-netlist', data),
    editFileNetList: (fileSpiceLib) => ipcRenderer.invoke('edit-file-netlist', fileSpiceLib),
    onSetText: (callback) => ipcRenderer.on('set-text', (event, filePath,data) => callback(filePath,data)),
    closeEditor: (callback) => ipcRenderer.on('close-editor', (event) => callback()),
    closeWindowEditor: () => ipcRenderer.send('close-window-editor'),
    saveCloseWindowEditor: (data,filepath,type_) => ipcRenderer.invoke('save-close-window-editor',data,filepath,type_),
    openFileDialogEditor: () => ipcRenderer.invoke('open-file-dialog-editor'),
    saveAsWindowEditor: (data,filepath) => ipcRenderer.invoke('save-as-window-editor',data,filepath),
    openDialogAbout: () => ipcRenderer.send('open-dialog-about'),
    showConfirmationEditDialog: (message) => ipcRenderer.invoke('show-confirmation-edit-dialog', message),
    //Python path dialog-------------------------------------------------------------------
    openDialogPythonPath: () => ipcRenderer.invoke('dialog-python-path'),
    pythonFolders: (callback) => ipcRenderer.on('python-folders', (event, dirs,dirsWithPath) => callback(dirs,dirsWithPath)),
    savePythonFolder: (folder) => ipcRenderer.invoke('save-python-folder', folder),
    getPythonFolder: () => ipcRenderer.invoke('get-python-folder'),
    
    //Edit html------------------------------------------------------------------------------
    editTextHtml: (text,caption) => ipcRenderer.invoke('edit-text-html', text,caption),
    onSetTextHtml: (callback) => ipcRenderer.on('set-text-html', (event, text) => callback(text)),
    sendEditedTextHtml: (text) => ipcRenderer.send('save-edited-text-html', text),
    //Edit codePy------------------------------------------------------------------------------
    editCodePy: (codeCircuit,codeAnalysis,caption) => ipcRenderer.invoke('edit-codePy', codeCircuit,codeAnalysis,caption),
    onSetCodePy: (callback) => ipcRenderer.on('set-codePy', (event, codeCircuit,codeAnalysis) => callback(codeCircuit,codeAnalysis)),
    sendEditedCodePy: (text) => ipcRenderer.send('save-edited-codePy', text),
    runPythonCode: (code) => ipcRenderer.send('run-python-code', code),
    onPyCodeProgress: (callback) => ipcRenderer.on("pyCode-progress", (event, data) => callback(data)),
    onPyCodeContainer: (callback) => ipcRenderer.on("pyCode-container", (event, data) => callback(data)),
    pyCodeClose: (callback) => ipcRenderer.on("pyCode-close", (event) => callback()),
    stopPythonExecution: () => ipcRenderer.send('stop-python-execution'),
    //Params----------------------------------------------------------------------------------
    editParams: (params, modelName) => ipcRenderer.invoke('edit-params', params, modelName),
    onSetParams: (callback) => ipcRenderer.on('set-params', (event, params, modelName) => callback(params, modelName)),
    sendEditedParams: (newParams) => ipcRenderer.send('save-edited-params', newParams),
    //Library Manager
    openLibraryManager: () => ipcRenderer.invoke('open-library-manager'),

    
    //In out signals/params-------------------------------------------------------------------
    listElemParams: (data,select) => ipcRenderer.invoke('list-elem-params', data,select),
    listSignalsParams: (data,select,acUsed) => ipcRenderer.invoke('list-signals-params', data,select,acUsed),
    listModels: (data) => ipcRenderer.invoke('list-models', data),
    onSetList: (callback) => ipcRenderer.on('set-list', (event, data,select,acUsed) => callback(data,select,acUsed)),
    sendEditedList: (newSelect, functionSelect) => ipcRenderer.send('save-list-value', newSelect, functionSelect),
    //Execut Script python-------------------------------------------------------------------
    executOP: (spiceCode) => ipcRenderer.invoke('show-exec-op', spiceCode),
    //Analysis-------------------------------------------------------------------------------
    analysisDialog: (source) => ipcRenderer.invoke('analysis-dialog',source),
    startProgress: () => ipcRenderer.send("start-progress"),
    stopProgress: () => ipcRenderer.send("stop-progress"),
    onProgressUpdate: (callback) => ipcRenderer.on("progress-update", (event, data) => callback(data)),
    onRandomData: (callback) => ipcRenderer.on("random-data", (event, data) => callback(data)),
    sendSpiceData: () => ipcRenderer.send('send-spice-data'),
    //Layout of Analysis---------------------------------------------------------------------
    layoutDialog: (data,select) => ipcRenderer.invoke('layout-dialog', data,select),
    onSetLayout: (callback) => ipcRenderer.on('set-data-layout', (event, data) => callback(data)),
    sendEditedLayout: (data) => ipcRenderer.send('get-data-layout', data),
    //Help------------------------------------------------------------------------------------
    openBrowserWindow:(event, data)=> ipcRenderer.send('open-browser-window',event,  data),

});





