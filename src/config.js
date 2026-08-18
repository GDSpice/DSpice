
const { app } = require('electron');
const path = require('path');

const createExecutable = false; // true or false

const exePath = process.execPath;
const basePath = path.dirname(exePath);

let folderPath;

if (createExecutable) {
    folderPath = basePath;
} else {
    folderPath = app.getAppPath();
}

let pathNgspice;
let appIcon;

if (process.platform === 'win32') {
    pathNgspice = path.join(folderPath,'ngspice','bin','ngspice_con.exe');
    appIcon = path.join(__dirname, 'build', 'logo.ico');
} else if (process.platform === 'linux') {
    pathNgspice = path.join(folderPath,'ngspice_linux','bin','ngspice');
    appIcon = path.join(__dirname, 'build', 'logo.png');
}


module.exports = {
    folderPath,
    pathNgspice,
    appIcon
};
