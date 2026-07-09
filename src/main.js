// main.js (Electron Main Process)
const { app, BrowserWindow, dialog, ipcMain , clipboard } = require('electron');


const handleDialogs = require('./handleDialogs');
const { startEditor } = require('./handleEditor');
const { setupHandlersParam } = require('./handleParam');
const { handlersListSignalsParams } = require('./handleListSignalsParams');
const handleExecSpice = require('./handleExecSpice');
const handleGestionSymbols = require('./handleGestionSymbols');
const handleLibraryManager = require('./handleLibraryManager');

const path = require('path');
const fs = require('fs');
const creatApp=false;
const config = require('./config');




//Creat DSpice Interface--------------------------------------------------------------------
let mainWindow;


app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximized: true,
    icon: path.join(__dirname, 'build', 'logo.ico'), // 🖼️ modified logo
    autoHideMenuBar: true,
    webPreferences: {
      preload:path.join(__dirname,'preload.js'), 
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });
  mainWindow.maximize();
  mainWindow.loadFile('form.html');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.key.toLowerCase() === 'r') {
        event.preventDefault();
    }
  
  // Notify renderer processes about focus changes
mainWindow.on('focus', () => {
       console.log('window active');
        mainWindow.webContents.send('window-active');
    });
});


  mainWindow.on('close', (event) => {
    event.preventDefault(); 
    mainWindow.webContents.send('request-close-IDE'); 
  });


  //handleDialogs.startDialogs(mainWindow);
  startEditor(mainWindow);
  setupHandlersParam(mainWindow);
  handlersListSignalsParams(mainWindow);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.on('close-window-IDE', () => {
  mainWindow.destroy();
 mainWindow = null;
});

/*
app.on('focus', () => {
       console.log('window active');
        mainWindow.webContents.send('window-active');
    });*/



// define the path for storing last used paths
const settingsPath = path.join(config.folderPath, 'lastPaths.json');  

// Load the last used paths from the JSON file
function loadLastPaths() {
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

// Save the last used paths to the JSON file
function saveLastPaths(paths) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(paths, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving last paths:', error);
    }
}

// Load the last used paths when the application starts
let lastPaths = loadLastPaths();


// IPC listener for file dialog---------------------------------------------------------------------------------------------

ipcMain.handle('open-file-dialog', async (event, pageType) => {

  const fileType = pageType === 'sym' ? 'sym' : 'dcs';
// Define the filters based on the page type
  if(pageType=='sym'){ 
    var setFilters=[{ name: 'symbol file (*.sym)', extensions: [ 'sym'] },
    { name: 'Designing Circuits and Simulation (*.dcs)', extensions: [ 'dcs'] }];
              }
  else {
    var setFilters=[{ name: 'Designing Circuits and Simulation (*.dcs)', extensions: [ 'dcs'] },
    { name: 'symbol file (*.sym)', extensions: [ 'sym'] }];
  }

  // Open a file dialog to select a file
  const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select a File',
      modal: true,
      buttonLabel: 'Open',
      properties: ['openFile'],
      filters: setFilters,
      defaultPath: lastPaths[fileType] || undefined
  });

  if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const fileExtension = path.extname(filePath).slice(1).toLowerCase();
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileName= path.basename(filePath);
      const folderPath=path.dirname(filePath);
      lastPaths[fileExtension] = path.dirname(filePath);
      saveLastPaths(lastPaths);
      return { filePath, fileContent, fileExtension, fileName, folderPath  };
  }
  return null;
});


// library (data.json) open and read---------------------------------------------------------------------

//Find all subfolders that contain files `.sym`
function findValidFolders(basePath) {
  let validFolders = [];

  function search(directory) {
      const items = fs.readdirSync(directory, { withFileTypes: true });
      let hasSymFile = false;

      for (let item of items) {
          const fullPath = path.join(directory, item.name);
          if (item.isDirectory()) {
              search(fullPath);
          } else if (item.isFile() && item.name.endsWith('.sym')) {
              hasSymFile = true;
          }
      }

      if (hasSymFile) {
          validFolders.push(path.relative(basePath, directory)); // save dierc
      }
  }

  search(basePath);
  return validFolders;
}

ipcMain.handle('read-symbols-file', async () => {

  const libraryPath = path.join(config.folderPath, 'symbols');
  const dataFilePath = path.join(config.folderPath,'symbols','data.json');


  let data =JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  let newData = { dirs: [] };
   
  console.log(libraryPath);
  const validFolders = findValidFolders(libraryPath);

  newData.dirs = [...new Set([...data.dirs, ...validFolders])].filter(folder => validFolders.includes(folder)); // Keep order and delete empty ones

  // Update the data for each valid folder
  validFolders.forEach(folder => {
      const folderPath = path.join(libraryPath, folder);
      const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.sym'));

      if (!data[folder]) {
          newData[folder] = files; // If the folder is new, add all its files
      } else {
          let oldFiles = data[folder] || [];
          let updatedFiles = [...new Set([...oldFiles, ...files])]; // Combine old and new files, ensuring uniqueness
          newData[folder] = updatedFiles.filter(file => files.includes(file)); // Keep only the files that still exist in the folder
      }
  });

  
  // Write the updated data to the JSON file
  fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 4), 'utf-8');

  return newData;

/*  const filePath = path.join(config.folderPath,'library', 'library.txt'); //path of file
  try {
      const data = fs.readFileSync(filePath, 'utf8'); // read file
      const jsonData = JSON.parse(data.replace(/'/g, '"')); // convert to json
      return jsonData;
  } catch (error) {
      console.error("error for read", error);
      return { error: "cont read file" };
  }*/
});

ipcMain.handle('get-library-path', async () => {
  const libraryPath = path.join(config.folderPath, 'lib', 'library.lib');
 // const folderPath = path.dirname(libraryPath);
  return  {libraryPath} ;
});


// Read files based on library name---------------------------------------------------------------
ipcMain.handle('get-library-files', async (event, libraryName, files) => {

  try {

        let fileContents = []; // Store file contents here
        


        for (const file of files) {
            const fullPath = path.join(config.folderPath,'symbols',libraryName, file);
            
            try {
                
                fileContents.push({'sym':fs.readFileSync(fullPath, 'utf8'),'name':file.split('.')[0]}); // Read the file content
            } catch (error) {
                
            }
          }
     return {fileContents}

  } catch (error) {
      console.error("File read error:", error);
      return { error: "Unable to read file" };
  }
});



// Display a confirmation message and return the result to `index.html`
ipcMain.handle('show-confirmation-dialog', async (event, message) => {
  const result = await dialog.showMessageBox(mainWindow,{
      type: 'question',
      modal: true,
      buttons: ["Yes","No","Cancel"], // The first button is the default.  //["Save","Don't save","Cancel"]
      defaultId: 2, // Makes "OK" the default
      title: 'Message Box',
      noLink: true,
      message: message
  });

  return result.response; // Return `true` if the user presses OK, otherwise `false`
});



// show alaert message----------------------------------------------------------------
ipcMain.on('show-alert', (event, title, message) => {
  dialog.showMessageBox(mainWindow, {
      type: 'info',
      modal: true,
      title: title,
      message: message,
      buttons: ['Ok']
  });
});



//Save as file---------------------------------------------------------------------------------
ipcMain.handle('save-as-file', async (event, filename, content, extension) => {
  
    const fileType = extension.toLowerCase();
    
    let description;
    if (fileType === 'sym') {
        description = 'Symbol file (*.sym)';
    } else {
        description = 'Designing Circuits and Simulation (*.dcs)';
    }

  const { filePath } = await dialog.showSaveDialog(mainWindow,{
        title: 'Save as file',
        modal: true,
        defaultPath: path.join(lastPaths[fileType] || '', filename),
        filters: [{ name: description, extensions: [fileType] }]
    });

  if (filePath) {
      try {
          fs.writeFileSync(filePath, content, 'utf-8');
          lastPaths[fileType] = path.dirname(filePath);
          saveLastPaths(lastPaths);
          return { success: true, path: filePath, fileName: path.basename(filePath)};
      } catch (error) {
          return { success: false, error: error.message };
      }
  }
  return { success: false, error: 'No file selected' };
});


//Save file--------------------------------------------------------------------------------------
ipcMain.handle('save-file', async (event, filename, content) => {

      try {
          fs.writeFileSync(filename, content, 'utf-8');
          const ext = path.extname(filename).slice(1).toLowerCase();
          if (ext === 'dcs' || ext === 'sym') {
            lastPaths[ext] = path.dirname(filename);
            saveLastPaths(lastPaths);
          }
          return { success: true, path: filename };
      } catch (error) {
          return { success: false, error: error.message };
      }
  
});


//Projects management----------------------------------------------------------------------
ipcMain.handle('create-folder-Models', async (event, filename) => {
    console.log(filename);
    const projectPath = path.dirname(filename);
    // build new folder path
    const modelsPath = path.join(projectPath, "models");
  try {
    if (!fs.existsSync(modelsPath)) {
      fs.mkdirSync(modelsPath, { recursive: true });
      return { success: true, message: 'Folder created successfully.', 'projectPath': projectPath, 'modelsPath': modelsPath };
    } else {
      return { success: false, message: 'Folder already exists.', 'projectPath': projectPath, 'modelsPath': modelsPath  };
    }
  } catch (error) {
    return { success: false, message: `Error creating folder: ${error.message}` };
  }   
});


ipcMain.handle('get-library-files-from-project', async (event, projectFile) => {
    console.log(projectFile);
    let fileContents = [];
    const folderPath = path.dirname(projectFile);
    // build new folder path
    const modelsPath = path.join(folderPath, "models");

    console.log(modelsPath);

    try {
        // قراءة جميع الملفات داخل modelsPath
        const files = fs.readdirSync(modelsPath);

        files.forEach(file => {
            if (file.endsWith(".sym")) {
                const filePath = path.join(modelsPath, file);
                const symContent = fs.readFileSync(filePath, "utf8");
                fileContents.push({
                    sym: symContent,
                    name: path.basename(file, ".sym")  // الاسم فقط
                });
            }
        });

    } catch (err) {
        console.error("Error reading modelsPath:", err);
    }
   
   return {fileContents}
});



//clipboard--------------------------------------------------------------------------------------
ipcMain.handle('read-clipboard', () => clipboard.readText());
ipcMain.handle('clipboard-write', (event, text) => {
  clipboard.writeText(text);
  return true;
});








