const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const config = require('./config');
const handleExecSpice = require('./handleExecSpice');



function setupHandlersParam(mainWindow) {
    ipcMain.handle('edit-params', async (event, params, modelName) => {
        return await createEditParamsDialog(params, modelName);
    });
}

// Create an edit params dialog
let editParamsDialog;

async function createEditParamsDialog(params, modelName) {
    return new Promise((resolve) => {
        editParamsDialog = new BrowserWindow({
            width: 500,
            height: 310,
            parent: BrowserWindow.getFocusedWindow(),
            icon: path.join(__dirname, 'build', 'logo.ico'), //
            modal: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            autoHideMenuBar: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });

        
        editParamsDialog.loadFile(path.join(__dirname, 'dialogs',"params.html"));

        editParamsDialog.webContents.once('did-finish-load', () => {
            editParamsDialog.webContents.send('set-params', params, modelName);
        });

        ipcMain.once('save-edited-params', (event, newParams) => {
            resolve(newParams);
            if (editParamsDialog) {
                editParamsDialog.close();
                editParamsDialog = null;
            }
        });
    });
}

module.exports = { setupHandlersParam };
