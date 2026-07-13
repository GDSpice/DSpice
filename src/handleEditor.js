const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { exec } = require('child_process');
const { spawn } = require("child_process");
handleExecSpice = require('./handleExecSpice');

const path = require('path');
const fs = require('fs');

const config = require('./config');

let winParent;

function startEditor(mainWindow) {
    winParent=mainWindow;  
}




//Creat editor netlist (spice)------------------------------------------------------------------------
let editWindow;

async function createEditWindow(filePath,data) {
    return new Promise((resolve) => {
        editWindow = new BrowserWindow({
            width: 800,
            height: 600,
            parent: BrowserWindow.getFocusedWindow(), // ⬅️ Make it a sub-window
            icon: path.join(__dirname, 'build', 'logo.ico'), // 🖼️ modified logo
            modal: true,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
       
        var pathEdit=path.join(__dirname,"editor","editor.html")
        editWindow.loadFile(pathEdit);

        editWindow.webContents.once('did-finish-load', () => {
            editWindow.webContents.send('set-text', filePath, data);
        });


        editWindow.on("close", (event) => {
        event.preventDefault();
        editWindow.webContents.send('close-editor');});
 
      
    });
}

ipcMain.on('close-window-editor', () => {
  editWindow.destroy();
  editWindow = null;
});

//Save on (close,open,new, save) editor-----------------------------------------------------------------------
ipcMain.handle('save-close-window-editor', async (event, data,filepath,type_) => {

    if(filepath!='New file'){
       fs.writeFileSync(filepath, data, 'utf-8');
       if(type_==1){
       editWindow.destroy();
       editWindow = null;
       }
       return {saved:true,path:filepath};
    }

    const {filePath} =  await dialog.showSaveDialog(editWindow,{
      title: 'Save as file',
  filters: [{ name: 'Spice lib' , extensions: ['lib'] },{ name: 'Spice net list' , extensions: ['net'] }]
  });


  if (filePath) {
      try {
          fs.writeFileSync(filePath, data, 'utf-8');
          if(type_==1){
          editWindow.destroy();
          editWindow = null;
          }

          return {saved:true,path:filePath};
          
      } catch (error) {
          return {saved:false};
      }
  }

  return {saved:false};


});

//load and save last paths for the editor---------------------------------------------------------

function loadLastPathsLib() {
    const settingsPath = path.join(config.folderPath, 'lastPaths.json'); 
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading last paths:', error);
    }
    const defaultPaths = { dcs: path.join(config.folderPath, 'demo'), sym: path.join(config.folderPath, 'symbols'), lib: path.join(config.folderPath, 'lib') };
    fs.writeFileSync(settingsPath, JSON.stringify(defaultPaths, null, 2), 'utf8');
    return defaultPaths; // Default paths if the file doesn't exist or an error occurs
}

function saveLastPathsLib(paths) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(paths, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving last paths:', error);
    }
}

let lastPathsLib = loadLastPathsLib();

//Save as editor---------------------------------------------------------------------
ipcMain.handle('save-as-window-editor', async (event, data,filepath) => {

  const {filePath} =  await dialog.showSaveDialog( editWindow, {
    title: 'Save as file',
    defaultPath: filepath,
    filters: [{ name: 'Spice lib' , extensions: ['lib'] },{ name: 'Spice net list' , extensions: ['net'] }]
  });

if (filePath) {

    lastPathsLib['lib'] = path.dirname(filePath);
    saveLastPathsLib(lastPathsLib);

    try {
        fs.writeFileSync(filePath, data, 'utf-8');
        return {saved:true,path:filePath};
        
    } catch (error) {
        return {saved:false};
    }
}

return {saved:false};


});

//open file editor-----------------------------------------------------------------------
ipcMain.handle('open-file-dialog-editor', async () => {

  const result = await dialog.showOpenDialog( editWindow, {
      title: 'Select a File',
      buttonLabel: 'Open',
      properties: ['openFile'],
      filters: [{ name: 'Spice lib' , extensions: ['lib'] },{ name: 'Spice net list' , extensions: ['net'] }],
      defaultPath: lastPathsLib['lib'] || undefined
  });

  if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      let fileContent = fs.readFileSync(filePath, 'utf8');
            // Remove BOM if present
            if (fileContent.charCodeAt(0) === 0xFEFF) {
                fileContent = fileContent.slice(1);
            }
      const fileName= path.basename(filePath);
      lastPathsLib['lib'] = path.dirname(filePath);
       saveLastPathsLib(lastPathsLib);
      return { filePath, fileContent, fileName};
  }
  return null;
});


//Open file from interface--------------------------------------------------------------------
ipcMain.handle('edit-text', async (event,filePath,linePos) => {
 
  let data = fs.readFileSync(filePath, 'utf8');
      // Remove BOM if present
      if (data.charCodeAt(0) === 0xFEFF) {
        data = data.slice(1);
    }
    return await createEditWindow(filePath,data);
});

ipcMain.handle('new-file-netlist', async (event, data) => {
      return await createEditWindow('New file',data);
  });

ipcMain.handle('edit-file-netlist', async (event, fileSpiceLib) => {
    if (fs.existsSync(fileSpiceLib)) {
       let data = fs.readFileSync(fileSpiceLib, 'utf8');
        // Remove BOM if present
        if (data.charCodeAt(0) === 0xFEFF) {
          data = data.slice(1);
      }
      return await createEditWindow(fileSpiceLib,data);
    } else {
    return await createEditWindow(fileSpiceLib,'');
    }
  });


// Display a confirmation message and return the result to `index.html`
ipcMain.handle('show-confirmation-edit-dialog', async (event, message) => {
  const result = await dialog.showMessageBox(editWindow,{
      type: 'question',
      modal: true,
      buttons: ['Cancel','No','Ok'], // The first button is the default.
      defaultId: 0, // Makes "OK" the default
      title: 'Message Box',
      message: message
  });

  return result.response; // Return `true` if the user presses OK, otherwise `false`
});

module.exports = {startEditor};