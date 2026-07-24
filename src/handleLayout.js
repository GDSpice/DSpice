const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');


function handlersLayout(mainWindow) {
ipcMain.handle('layout-dialog', async (event, data) => {
        return await createListWindow(data);
    });
}

   




let listWindow;

async function createListWindow(data) {
    return new Promise((resolve) => {
        listWindow = new BrowserWindow({
            width: 580,
            height: 850,
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
        var pathpage=path.join(__dirname,'dialogs','layout.html')
        listWindow.loadFile(pathpage);
        listWindow.webContents.once('did-finish-load', () => {
            listWindow.webContents.send('set-data-layout', data);
        });

        ipcMain.once('get-data-layout', (event, data) => {
            console.log(data);
            resolve(data);
            if (listWindow) {
                listWindow.close();
                listWindow = null;
            }
        });
    });
}


module.exports = {handlersLayout};