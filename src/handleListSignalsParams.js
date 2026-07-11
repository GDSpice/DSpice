const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const config = require('./config');
const handleExecSpice = require('./handleExecSpice');

function handlersListSignalsParams(mainWindow) {
    ipcMain.handle('list-elem-params', async (event, data,select) => {
        return await createListWindow(data,select,'listElem.html');
    });

    ipcMain.handle('list-signals-params', async (event, data,select) => {
        return await createListWindow(data,select,'list.html');
    });


}



let listWindow;

async function createListWindow(data,select,fileHtml) {
    return new Promise((resolve) => {
        listWindow = new BrowserWindow({
            width: 400,
            height: 710,
            parent: BrowserWindow.getFocusedWindow(),
            modal: true,
            resizable: true,
            minimizable: false,
            maximizable: false,
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'build', 'logo.ico'), 
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
        var pathpage=path.join(__dirname,'dialogs',fileHtml)
        listWindow.loadFile(pathpage);
        listWindow.webContents.once('did-finish-load', () => {
            listWindow.webContents.send('set-list', data, select);
        });

        ipcMain.once('save-list-value', (event, newSelect) => {
            console.log(newSelect);
            resolve(newSelect);
            if (listWindow) {
                listWindow.close();
                listWindow = null;
            }
        });
    });
}

module.exports = {handlersListSignalsParams};
