

async function openFile(pageType){
  const result = await window.electron.openFileDialog(pageType);
  if (result) {
    addNewTabOpenFile(result.fileExtension,result.filePath,result.fileContent,result.fileName);
    drawing.path=result.folderPath;
    enable();
    updateListElements();
    displayByPageType();
  }    
  
}



async function loadSymbols() {
const data = await window.electron.readSymbolsFile();
drawing.newPage('dcs');
drawing.dirLibrary=[];
data['dirs'].forEach(item => drawing.dirLibrary.push(item));
user={fileName:'New file',fileExtension:'dcs',baseName:'New file'};
document.getElementById("ItProject").firstChild.checked =false;
const libraryName=data['dirs'][0];
const files=data[libraryName];
const files_ = await window.electron.getLibraryFiles(libraryName,files);
addItemsToPageLibs(data['dirs']);
addListSymbToPageLibs(files_.fileContents);
displayByPageType();
}








async function importSymbols(pos){

if(pos!=9999){
  const data = await window.electron.readSymbolsFile();
  var symbolName=data['dirs'][pos];
  var files=data[symbolName];
  const files_ = await window.electron.getLibraryFiles(symbolName,files);
  addListSymbToPageLibs(files_.fileContents);
}
 else{
  const files_project = await window.electron.getLibraryFilesFromProject(user.fileName);
 addListSymbToPageLibs(files_project.fileContents);
 }

}


function newCircuit(){
   loadSymbols();
   
}

function newSymbol(){
   drawing.newPage('sym');
   updateListElements();
   user={fileName:'New file', fileExtension:'sym', baseName:'New file', folderPath:''};
   displayByPageType();
}



async function saveAsFile() {

  const activeFile = files.find(f => f.active);
  const content = drawing.getSymbol();

  const result = await window.electron.saveAsFile(activeFile.name, content, activeFile.type);

  if (result.success) {
    activeFile.filePath = result.path;
    activeFile.name = result.fileName;
    drawing.fileName=result.fileName;
    drawing.path=result.folderPath;
    drawing.modified=false;
    saveCurrentTab();
    renderTabs();
    caption();
    return true;
  }

  return false;
}


async function saveFile() {

  const activeFile = files.find(f => f.active);
  const content = drawing.getSymbol();

  if(!activeFile.filePath)
    return await saveAsFile();

  const result = await window.electron.saveFile(activeFile.filePath, content);
  if (result.success) {
    drawing.modified=false;
    saveCurrentTab();
    caption();
    return true;
  } else {
      return false;
  }
}


function window_load() {
//loadLibrary();
dataToInterface();


};

function caption(){
            if (drawing.pageType=='sym') var title='Symbol Editor'; 
           else var title='Circuit Design and Simulation by Spice';

           if(drawing.modified)
               document.title=title+'  ['+drawing.fileName+'* ]';
           else 
               document.title =title+'  ['+drawing.fileName+']';
      }




  
