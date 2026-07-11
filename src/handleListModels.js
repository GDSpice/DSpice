const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');



// ============================================
// CONFIGURATION - Update this path
// ============================================
const LIB_DIR = path.join(config.folderPath,'lib');
const LIB_FILE = path.join(LIB_DIR, 'library.lib');

// Store last dialog result to pass back on reopen


function openListEditorDialog(previousResult) {
  const dialogWindow = new BrowserWindow({
    width: 600,
    height: 700,
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
    }
  });
  var pathpage=path.join(__dirname,'dialogs','listModels.html')
  dialogWindow.loadFile(pathpage);

  dialogWindow.once('ready-to-show', () => {
    dialogWindow.show();
    // Send previous result + library files list
    const libFiles = getLibraryFiles();
    dialogWindow.webContents.send('init-data', {
      previousResult: previousResult,
      libFiles: libFiles
    });
  });

  return new Promise((resolve) => {
    ipcMain.once('dialog-result', (event, result) => {
      dialogWindow.close();
      resolve(result);
    });

    dialogWindow.on('closed', () => {
      resolve(null);
    });
  });
}

// Get list of .lib files referenced in library.lib
function getLibraryFiles() {
  const files = [];
  try {
    if (fs.existsSync(LIB_FILE)) {
      const content = fs.readFileSync(LIB_FILE, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('.include')) {
          const match = trimmed.match(/\.include\s+"(.+)"/);
          if (match) {
            const filePath = match[1];
            // For local files, resolve full path
            if (!filePath.includes('\\') && !filePath.includes('/')) {
              files.push({ name: filePath, fullPath: path.join(LIB_DIR, filePath) });
            } else {
              files.push({ name: path.basename(filePath), fullPath: filePath });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error reading library.lib:', e);
  }
  return files;
}

// Handle request to get models/subckts from a file
ipcMain.on('get-spice-models', (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      event.reply('spice-models-result', { error: 'File not found: ' + filePath });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const models = [];
    const subckts = [];

    // Extract .model NAME
    const modelRegex = /\.model\s+(\S+)/gi;
    let m;
    while ((m = modelRegex.exec(content)) !== null) {
      models.push(m[1]);
    }

    // Extract .subckt NAME
    const subcktRegex = /\.subckt\s+(\S+)/gi;
    while ((m = subcktRegex.exec(content)) !== null) {
      subckts.push(m[1]);
    }

    event.reply('spice-models-result', {
      models: [...new Set(models)],
      subckts: [...new Set(subckts)],
      rawContent: content
    });

  } catch (error) {
    event.reply('spice-models-result', { error: error.message });
  }
});

// Handle open list models dialog request from page

ipcMain.handle('list-models',  async (event,data) => {
  const result = await openListEditorDialog(data);
  console.log('Result:', result);
  return result;
});