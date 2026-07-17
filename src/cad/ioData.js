/*
#-------------------------------------------------------------------------------
# Name:        ioData.js
# Description: In and Out data
# Author:      d.fathi
# Created:     29/08/2021
# Update:      24/06/2026
# Copyright:   (c) DSpice 2026
# Licence:     free 
#-------------------------------------------------------------------------------
*/
var libarayPath='';

async function getLibraryPath() {
    const result= await window.electron.getLibraryPath();
    libarayPath=result.libraryPath;
     console.log(libarayPath);
}

 getLibraryPath();






function generatNewModel(modelName){

  let date_str = new Date().toLocaleDateString();
  let time_str = new Date().toLocaleTimeString();

  let newModel = `
*-------------------------------------------------------------------------------
* Name:        ${modelName}
* Author:
* Created:     ${date_str} at ${time_str}
* Modified:    ${date_str}
* Copyright:   (c)
*-------------------------------------------------------------------------------
`;
    return newModel;
}









async function showParams(){

   try {     
      
          const editedParams = await window.electron.editParams(result,modelName);
          setParams(editedParams);
        } catch (error) {
        
          window.electron.showAlert('Error', error.message);
      }
}









async function ioPosProbe() {
    //get probe name
    var str = mtable.select.childNodes[2].textContent.split('=');
 
    
    //get new pos of probe
    try {
        const result = getElementListSpice();
        const result_ = await window.electron.listSignalsParams(result,str[0]);

        if(result_){
            mtable.select.childNodes[2].textContent=result_;
            findPosProb();
        }
        

      } catch (error) {
        window.electron.showAlert('Error',error.message);
    }
}


async function ioProbe(){
    //get probe name
    var str = mtable.select.childNodes[2].textContent.split('=')[0];
   codeSpice= getCodeSpiceByProbe(str);

  try {
       
     if(codeSpice.data!='0'){
      const result = await window.electron.executOP(codeSpice.code);
      console.log(result);
      var str = mtable.select.childNodes[2].textContent.split('=')[0];
      var unit='V';
      if(codeSpice.type=='current') unit='A';
      mtable.select.childNodes[2].textContent=str+'='+result.results.results[0].formatted+unit;
     } else  mtable.select.childNodes[2].textContent=str+'=0.0V';
      structProbe(mtable.select);
    } catch (error) {
      window.electron.showAlert('Error',error.message);
    }
}

function setPropValue(val){
  var str = mtable.select.childNodes[2].textContent.split('=')[0];
  mtable.select.childNodes[2].textContent=str+'='+val;
  structProbe(mtable.select);
}

//--------------------------------Op Analysis-----------------------------//

async function opAnalysis(){

   codeSpice= getSourceSpiceForOp();

  try {
      const result = await window.electron.executOP(codeSpice.code);
      console.log(result);
      for(var i=0; i<codeSpice.outputs.length; i++){
        var elem = codeSpice.outputs[i].elem;
        var str = elem.textContent.split('=')[0];
        elem.childNodes[2].textContent=str+'='+result.results.results[i].formatted+codeSpice.outputs[i].unit;
        structProbe(elem);
      }

      var list=codeSpice.list;
        for(var i=0; i<list.length; i++){
        var elem = list[i].elem;
        if(!list[i].used){
        var str = elem.textContent.split('=')[0];
        elem.childNodes[2].textContent=str+'=0.0 V';
        structProbe(elem)
        }
      }

 
    } catch (error) {
      window.electron.showAlert('Error',error.message);
    }
}

function setPropValue(val){
  var str = mtable.select.childNodes[2].textContent.split('=')[0];
  mtable.select.childNodes[2].textContent=str+'='+val;
  structProbe(mtable.select);
}


//--------------------------------actions of Analysis--------------------//

async function ioPosParamAnalysis(type,acUsed) {
 
    var str =''

    try {
       
        const result = getElementListSpice();
        const result_ = await window.electron.listSignalsParams(result,str,acUsed);
        if(result_)
          ioSetPosProbe(result_.selectedSignal,result_.selectedFunction);       

      } catch (error) {
        
    }
}


async function ioPosParamAnalysisDC(name) {

    try {
        const list=getEleForDCAnalys();
        const result_ = await window.electron.listElemParams(list,name);
        if(result_)
         ioSetPosDCAnalysis(result_);
      } catch (error) {
        
    }
}

function getParamAnalysis(type,name)
{

  mtable.typeUsedDC=false;
  mtable.typeUsedOutput=false;
  mtable.typeUsedSOutput=false;
  mtable.typeUsedXOutput=false;
  mtable.typeUsedYOutput=false;
  mtable.typeUsedSOutput=false;
  var analy=JSON.parse(mtable.select.getAttribute("description"));

  if(type=="dc")
  {
    mtable.typeUsedDC=true;
    ioPosParamAnalysisDC(name);
  } else if(type==0){
    mtable.typeUsedYOutput=true; 
    ioPosParamAnalysis(type,analy.type=='AC Analysis');
  } else if(type==1){
    mtable.typeUsedXOutput=true;
    ioPosParamAnalysis(type,analy.type=='AC Analysis');
  } else if(type==2){
    mtable.typeUsedSOutput=true;
    ioPosParamAnalysis(type,analy.type=='AC Analysis');
  }
}



function ioSetPosDCAnalysis(name) {
       var analy=JSON.parse(mtable.select.getAttribute("description"));
       analy.dcsweep.param=name;
       console.log(name);
       analy.dcsweep.unit='V';
       mtable.select.setAttribute("description", JSON.stringify(analy));
       mtable.typeUsedDC=null;
       analysisSelect();
       mtable.parent.creat();
      
 }

function ioSetPosProbe(name,func) {

    var nodes=getNetRefs();
    var probe=parseSignal(name, nodes);

    if(mtable.type=='analysis'){
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var r=dc.yAxe.outputs;
	       var x=dc.xAxe;
       } else if(analy.type=='Time Domain') {
         var tr=analy.time
         var r=tr.yAxe.outputs;
         var x=tr.xAxe;
      } else if(analy.type=='AC Analysis') {
         var ac=analy.ac;
         var r=ac.yAxe.outputs;
         var x=ac.xAxe;  
       }

    }

   // if(func) name=func+'('+name+')';

    if(mtable.typeUsedYOutput)
    {
      var output={name:name,unit:probe.unit,type:probe.type,color:'#000000',pos:1};
      if(func &&  (analy.type=='AC Analysis')) output.func=func;
      r.push(output);
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedYOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
  
    if(mtable.typeUsedXOutput)
    {
       x.name=name;
       x.unit=probe.unit;
       x.type=probe.type;
       x.used=true;

      if(func &&  (analy.type=='AC Analysis')) x.func=func;

      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedXOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
  
    if(mtable.typeUsedSOutput)
    {
      var analy=JSON.parse(mtable.select.getAttribute("description"));
      var output={name:name,unit:probe.unit,type:probe.type,color:'#000000',pos:1};
      if(func &&  (analy.type=='AC Analysis')) output.func=func;
      analy.secondsweep.outputs.push(output);
      mtable.select.setAttribute("description", JSON.stringify(analy));
      mtable.typeUsedSOutput=null;
      analysisSelect();
      mtable.parent.creat();
      return;
    }
   
    if(mtable.typeUsedDC)
     {
       var analy=JSON.parse(mtable.select.getAttribute("description"));
       analy.dcsweep.param=name;
       analy.dcsweep.unit='V';
       mtable.select.setAttribute("description", JSON.stringify(analy));
       mtable.typeUsedDC=null;
       analysisSelect();
       mtable.parent.creat();
       return;
     }
  
      mtable.newElem.setAttribute("value", pos);
      
      if (mtable.typeSelect == 'probe') {
          mtable.select.childNodes[2].textContent = pos;
          mtable.select.setAttribute("pos",pos);
          mtable.select.setAttribute("unit",unit_);
          mtable.select.setAttribute("type",type_);
          var c=colorByUnit(unit_);
          mtable.select.childNodes[0].style.stroke =c;
          mtable.select.childNodes[1].style.stroke =c;
          mtable.select.childNodes[1].style.fill   =c;
          structProbe(mtable.select);
          return;
      }
  
  }

  async function openEditorListModels(){

    try {


      var lastDialogResult = {
        file: mtable.select.getAttribute("modelfile"),
        items: mtable.select.getAttribute("modellist")
      };
      
        const result = await window.electron.listModels(lastDialogResult);
        console.log('Result:', result);
        if(result){
            mtable.select.setAttribute("modellist",result.items);
            mtable.select.setAttribute("modelfile",result.file);
            modelSelected();
        }
      }
    catch (error) {
        window.electron.showAlert('Error',error.message);
    }
  }



  async function runAnalysis(){
   
   var spice=getSourceSpiceForAnalysis();
   console.log(spice.code);
   const v=await window.electron.analysisDialog(spice.code);
   console.log(v);
   dataPlot(v.results.results,spice)
  }


  function dataPlot(list,spice)
{
  
	var elem=drawing.resize.setElement;
  var analy=JSON.parse(elem.getAttribute("description"));
	var title=analy.title;
  var secondsweep=analy.secondsweep;
  var elem0= drawing.resize.setElement.lastChild.firstChild;
  var layout = JSON.parse(elem0.getAttribute("layout"));
  var nList=list.length-1;

// X Axe descriptio---------------------------------------------------------------------------------
 
    if(analy.type === "DC Sweep"){
     var xNameAnalysis=analy.dcsweep.param
   } else if(analy.type === "AC Analysis"){
     var xNameAnalysis='Frequency[Hz]'
   } else {
     var xNameAnalysis='Time[sec]'
   }

      var analy=JSON.parse(mtable.select.getAttribute("description"));
      if(analy.type=='DC Sweep'){
         var dc=analy.dcsweep;
         var r=dc.yAxe.outputs;
	       var xa=dc.xAxe;
       } else if(analy.type=='Time Domain') {
         var tr=analy.time
         var r=tr.yAxe.outputs;
         var xa=tr.xAxe;
      } else if(analy.type=='AC Analysis') {
         var ac=analy.ac;
         var r=ac.yAxe.outputs;
         var xa=ac.xAxe;  
       }

layout.xaxis.title.text=xNameAnalysis;

 
var xAxe=xa;
var setX=[];

if(xAxe.used){
  var xpos=list.length-1;
  layout.xaxis.title.text=spice.outputs[xpos].name +' ['+spice.outputs[xpos].unit+']';
     for(var j=0; j< list[xpos].data.length; j++){
     setX.push(list[xpos].data[j][1]);
    }
} else {
  var xpos=list.length;
}


//Plot data------------------------------------------------------------------------------------------
  
  var data=[];
  for (var i = 0; i < xpos; i++) {

    var x=[];
    var y=[];

   if(xAxe.used)
    x=setX;

   for(var j=0; j< list[i].data.length; j++){
    if(!xAxe.used)
     x.push(list[i].data[j][0]);
     y.push(list[i].data[j][1]);
    }
   
    if(spice.outputs[i].func)
      var func=spice.outputs[i].func;
    else
      var func='';
    
    data.push({
                  type: 'scatter',
                  name: spice.outputs[i].name +' '+func+'['+spice.outputs[i].unit+']',
                  line: {
                      color: spice.outputs[i].color
                  },
                  y: y,
                  x: x,
                  xaxis: 'x',
                  yaxis: 'y'
              });
  }


  /*
    var xaxis= 'x'+spice.outputs[i].pos;
    var yaxis= 'y'+spice.outputs[i].pos;
    if(xaxis=='x1') xaxis='x';
    if(yaxis=='y1') yaxis='y';
    var setXpos='xaxis'+spice.outputs[i].pos;

    console.log(setXpos);

    if(setXpos!='xaxis1')
      layout[setXpos].title.text=xNameAnalysis;
*/

 /*console.log(row+','+col);
 console.log(temp)
  
 layout.grid = {
    rows: row,
    columns: col,
    pattern: 'independent',
    roworder: 'bottom to top'
  };

for(var i=2; i<=temp.length;i++){

}*/



  
var elem=drawing.resize.setElement.lastChild.firstChild;
//elem.innerHTML = "<div name='plots' style='border-style: double;zoom:60%'  ondblclick='showPlotInModel(this)'></div>";
Plotly.newPlot(elem, data, layout, plotConfig);
Plotly.update(elem);
}

//---------------------------------get Spice  version-------------------------//
async function getSpiceVersion(){

  try {
  
    ioDic.spiceVersion='ngspice42';; 
  } catch (error) {
    window.electron.showAlert('Error',error.message);
  }
}

