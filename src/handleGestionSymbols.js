const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');

let symbolsManagementWindow;

async function createSymbolsManagementWindow(data) {
    return new Promise((resolve) => {
        symbolsManagementWindow = new BrowserWindow({
            width: 480,
            height: 410,
            parent: BrowserWindow.getFocusedWindow(), // ⬅️ Make it a sub-window
            icon: path.join(__dirname, 'build', 'logo.ico'), // 🖼️ modified logo
            modal: true,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
       
        var pathIntarface=path.join(__dirname,"dialogs","symbolsManagement.html")
        symbolsManagementWindow.loadFile(pathIntarface);
        symbolsManagementWindow.webContents.once('did-finish-load', () => {
           symbolsManagementWindow.webContents.send('set-data-symbols',data);
        });
       
       

        symbolsManagementWindow.on("close", (event) => {
      
        event.preventDefault();
        symbolsManagementWindow.destroy();
        symbolsManagementWindow= null;
       });


     ipcMain.once('save-library-json', (event, newData) => {
        resolve(true);
        const dataFilePath = path.join(config.folderPath,'symbols','data.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 4), 'utf-8');
        if (symbolsManagementWindow) {
        symbolsManagementWindow.close();
        symbolsManagementWindow= null;
        }
        
               
            });
        
 
      
    });
}


ipcMain.handle('symbols-management', async (event) => {
      const dataFilePath = path.join(config.folderPath,'symbols','data.json');
      let data =JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

    return await createSymbolsManagementWindow(data);
});