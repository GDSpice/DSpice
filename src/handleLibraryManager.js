const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');

let mainWindow;

// ============================================
// CONFIGURATION - Update this path
// ============================================
const LIB_DIR = path.join(config.folderPath,'lib');
const LIB_FILE = path.join(LIB_DIR, 'library.lib');

 function createWindow() {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 650,
        minWidth: 600,
        minHeight: 500,
        parent: BrowserWindow.getFocusedWindow(),
        modal: true,
        resizable: true,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'build', 'logo.ico'), 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'Library Manager',
        show: false,
        center: true
    });

    var pathpage=path.join(__dirname,'dialogs','libraryManager.html')

    mainWindow.loadFile(pathpage);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        loadLibraryData();
    });

    // Prevent closing if there are unsaved changes
    mainWindow.on('close', async (e) => {
        e.preventDefault();
        const isDirty = await mainWindow.webContents.executeJavaScript('window.isDirtyState');
        if (isDirty) {
            const result = await dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Save', 'Discard', 'Cancel'],
                defaultId: 0,
                cancelId: 2,
                title: 'Unsaved Changes',
                message: 'You have unsaved changes.',
                detail: 'Do you want to save your changes before closing?',
                noLink: true
            });

            if (result.response === 0) {
                // Save
                mainWindow.webContents.send('confirm-save-and-close');
            } else if (result.response === 1) {
                // Discard
                mainWindow.removeAllListeners('close');
                mainWindow.close();
            }
            // Cancel: do nothing, stay open
        } else {
            mainWindow.removeAllListeners('close');
            mainWindow.close();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function loadLibraryData() {
    try {
        let includes = [];

        if (fs.existsSync(LIB_FILE)) {
            const content = fs.readFileSync(LIB_FILE, 'utf-8');
            const lines = content.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('.include')) {
                    const match = trimmed.match(/\.include\s+"(.+)"/);
                    if (match) {
                        const filePath = match[1];
                        const isExternal = filePath.includes('\\') || filePath.includes('/');
                        includes.push({
                            path: filePath,
                            isExternal: isExternal
                        });
                    }
                }
            }
        }

        mainWindow.webContents.send('init-data', {
            libDir: LIB_DIR,
            libPath: LIB_FILE,
            includes: includes
        });

    } catch (error) {
        console.error('Error loading library:', error);
        dialog.showErrorBox('Error', `Failed to read file: ${error.message}`);
    }
}

// Handle file picker request
ipcMain.on('pick-library-file', async (event, currentPaths) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Select Library File',
            defaultPath: LIB_DIR,
            properties: ['openFile'],
            filters: [
                { name: 'Library Files', extensions: ['lib'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const selectedPath = result.filePaths[0];
            const selectedDir = path.dirname(selectedPath);
            const fileName = path.basename(selectedPath);

            // Check if trying to add library.lib itself
            if (fileName.toLowerCase() === 'library.lib') {
                event.reply('file-picked', {
                    error: 'Cannot add library.lib to itself.'
                });
                return;
            }

            // Check if already exists in current list
            const isExternal = selectedDir.toLowerCase() !== LIB_DIR.toLowerCase();
            const storedPath = isExternal ? selectedPath : fileName;

            if (currentPaths.includes(storedPath.toLowerCase())) {
                event.reply('file-picked', {
                    error: `File "${fileName}" is already in the list.`
                });
                return;
            }

            event.reply('file-picked', {
                path: storedPath,
                isExternal: isExternal,
                fullPath: selectedPath
            });
        }
    } catch (error) {
        console.error('Error picking file:', error);
        event.reply('file-picked', { error: error.message });
    }
});

// Handle save request
ipcMain.on('save-library', (event, data) => {
    try {
        const lines = data.includes.map(item => {
            const filePath = item.isExternal ? item.path : path.basename(item.path);
            return `.include "${filePath}"`;
        });

        const content = lines.join('\n') + '\n';
        fs.writeFileSync(LIB_FILE, content, 'utf-8');

        event.reply('save-result', { success: true });

    } catch (error) {
        console.error('Error saving library:', error);
        event.reply('save-result', {
            success: false,
            error: error.message
        });
    }
});

// Handle cancel - use native message box for confirmation
ipcMain.on('cancel-dialog', async () => {
    if (!mainWindow) return;

    const isDirty = await mainWindow.webContents.executeJavaScript('window.isDirtyState');

    if (isDirty) {
        const result = await dialog.showMessageBox(mainWindow, {
            type: 'warning',
            buttons: ['Save', 'Discard', 'Cancel'],
            defaultId: 0,
            cancelId: 2,
            title: 'Unsaved Changes',
            message: 'You have unsaved changes.',
            detail: 'Do you want to save your changes before closing?',
            noLink: true
        });

        if (result.response === 0) {
            // Save
            mainWindow.webContents.send('confirm-save-and-close');
        } else if (result.response === 1) {
            // Discard
            mainWindow.removeAllListeners('close');
            mainWindow.close();
        }
        // Cancel: do nothing, stay open
    } else {
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
});

// Force close without saving (after save completes)
ipcMain.on('force-close', () => {
    if (mainWindow) {
        mainWindow.removeAllListeners('close');
        mainWindow.close();
    }
});

ipcMain.handle('open-library-manager', async (event) => {
      return createWindow();
  });