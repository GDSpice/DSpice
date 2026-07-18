/*
#--------------------------------------------------------------------------------------------------
# Name:        drawing.js
# Author:      d.fathi
# Created:     05/07/2021
# Update:      05/08/2024
# Copyright:   (c)  DSpice 2026
# Licence:     free
#---------------------------------------------------------------------------------------------------
*/

//--------------------------------Class  of drawing-------------------------------------------//

function fdrawing(div) {

    var self = this;
    self.div = div;
    self.electronjs=true;
    self.objectInspector = null;
    self.itSymbol = true;
    self.usedByInterface = false;
    self.modified = false;
    self.posUndo = 0;
    self.copyList = [];
    self.pins = [];
	self.vars=[];
    self.maxIdNet= -1;
    self.pageType='sym';
	self.objectInspector=null;
	self.showPolarity=false;
    self.filesPy=[]
    self.filesSy=[]
    self.itProject=false;
    self.path='';
    self.copyData=false;
    
    //*************Creat body of drawing************************************************************//
    
    createBody(self);
    this.grid = new fgrid("svg", 1800, 1800);
    this.shapes = new fshapes("svg", self, 1800, 1800);
    this.resize = new fresize("svg", self, 1800, 1800);
    this.symbol = {
        name: "New Symbol",
        reference: "X",
        model: { type: "SPICE", name: "None" },
        destination: "local",
        description: {webPage:'',info:''}
    };
    this.elemg = '<g width="1550" top="0" left="0" height="1550"  version="0.0.7" zoom="3" reference="X" description=" "></g>';
    this.grid.resize = self.resize;
    this.shapes.resize = self.resize;
	  this.resize.grid=this.grid;
    this.data = [{
            setDescription: 'New',
            symbol: self.elemg
        }];



    this.changPositionRuler = function () {
        self.grid.getRuler();
    };

	this.showGrid=function(show){
		self.grid.showGrid=show;
		self.grid.getGrid();
	}

    this.add = function (type) {
        self.shapes.addElement(type);
    }

    this.zoomIn = function () {
        self.grid.zoomIn();
    }

    this.zoomOut = function () {
        self.grid.zoomOut();
    }

    document.getElementById("areaGlobal").addEventListener("scroll", self.changPositionRuler);

    self.setSize = function (w, h) {
        var r = (h) + 'px'
        document.getElementById("areaGlobal").style.height = r;
    }

    //*************Option of simulation************************************************************//
    self.getOptionSimulation=function()
      {
	     return {};//itl:200, aftol:1e-8, aptol:1e-6, reltol:1e-3, error:1e-8, integration:'trapezoidal', interval:300
      }

    this.optionsimulation=self.getOptionSimulation();

    //************Actions of edit and show*****************************************************//

    self.saveData = function (description) {
		plotsSaveDataLayoutInDiv();

        self.data.push({
            setDescription: description,
            symbol: document.getElementById("sym").innerHTML
        });
        self.posUndo = self.data.length - 1;
        self.modified = true;
    }

    self.undo = function () {
        if (self.posUndo <= 0)
            return;
        self.posUndo = self.posUndo-1;
        self.resize.deletEllipse();
        document.getElementById("sym").innerHTML = self.data[self.posUndo].symbol;
        self.modified = true;
		plotsOpenDataLayoutInDiv();
    }

    self.redo = function () {

        if (self.posUndo >= self.data.length - 1)
            return;
        self.posUndo = self.posUndo+1;
        self.resize.deletEllipse();
        document.getElementById("sym").innerHTML = self.data[self.posUndo].symbol;
        self.modified = true;
		plotsOpenDataLayoutInDiv();
    }

	self.getDescUndo=function(){
		return self.data[self.posUndo].setDescription;
	}

    self.copy = async function () {
    self.copyList = [];

        if (self.shapes.lsg.elms.length > 0) {
            self.copyList = [];
            for (var i = 0; i < self.shapes.lsg.elms.length; i++) {
                self.copyList.push({
                    node: self.shapes.lsg.elms[i].outerHTML
                });
            }
        } else if (self.resize.setElement) {
            self.copyList = [];
            self.copyList.push({
                node: self.resize.setElement.outerHTML
            });
        }
    
    var data_ = { pageType: self.pageType, copyList: self.copyList };
    var clipboardData = JSON.stringify(data_);
    await window.electron.writeClipboard(clipboardData);
    self.copyData=true;
    
};

	self.active=function()
	{
		clearSelectElms(self.shapes);
    self.resize.deletEllipse();
		refNetWithPart();
	}

self.past = async function () {
    try {
        const clipboardText = await window.electron.readClipboard();
        let data = JSON.parse(clipboardText);

        if (!data.copyList?.length) {
            // "لا توجد عناصر للصق";
            return;
        }

        const svgContainer = document.getElementById("sym");
        self.copyList = [];
        self.copyLength = data.copyList.length;

        for (const item of data.copyList) {
            if (!item.node) continue;

            // إنشاء حاوية مؤقتة في نفس مساحة اسم SVG
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.innerHTML = item.node;
            
            // نقل جميع العناصر
            while (tempSvg.firstChild) {
                const node = tempSvg.firstChild;
                svgContainer.appendChild(node);
                self.copyData=true;
            }
        }

        deletMultiRef();
        selectPast(self);
        self.saveData('Past ');

        //("تم اللصق: " + self.copyList.length + " عنصر");
        
    } catch (err) {
        console.error(err);
        // ("فشل اللصق: " + err.message);
    }
};

    self.cut = function () {
        self.copy();
        if (self.shapes.lsg.elms.length > 0) {
            for (var i = 0; i < self.shapes.lsg.elms.length; i++)
                self.shapes.lsg.elms[i].remove();
            clearSelectElms(self.shapes);
            self.saveData('Cut ');
        } else if (self.resize.setElement) {
            self.resize.setElement.remove();
            self.resize.deletEllipse();
            self.saveData('Cut ');
        }



    };

    self.itCopyData = async function () {
    
    try {
        const clipboardText = await window.electron.readClipboard();
        let data = JSON.parse(clipboardText);
        self.copyData=data.pageType==self.pageType;
    } catch (err) {
        console.error(err);
        self.copyData=false;
    }
    enable();
    return self.copyData;
    }

    //******************Actions of file************************************************************//

    self.newPage = function (type) {
        clearSelectElms(self.shapes);
        self.resize.deletEllipse();
		self.showPolarity=false;
		self.optionsimulation=self.getOptionSimulation();
        self.itProject=false;

		svg=document.getElementById('nodes');
	    svg.innerHTML='';

        if (type == 'sym') {
            self.grid.zoom = 6;
            self.grid.pageSize(350, 350);
        } else {
            self.grid.zoom = 3;
            self.grid.pageSize(1500, 1500);
        }

        document.getElementById("sym").innerHTML = self.elemg;
        self.grid.area.areaGlobal.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
        self.modified = false;
        self.posUndo = 0;
        self.data = [{
                setDescription: 'New',
                symbol: self.elemg
            }
        ];
        self.pageType = type;
        self.symbol = {
        fname:"NewFile.sym",
        name: "New Symbol",
        model:{ type: "SPICE", name: "None"},
        reference: "X",
        destination: "local",
        description: " ",
        type:"None"
    };
    
     if(self.objectInspector)
		 self.objectInspector.getDescriptionPage();
	 //->getPageLibDesc(self.pageType);
    }

    self.setSymbolDescription = function () {
        sym = document.getElementById("sym").firstChild;
        var width = sym.getAttribute("width");
        var height = sym.getAttribute("height");
        var zoom = parseFloat(sym.getAttribute("zoom"));
        var scrollLeft = parseInt(sym.getAttribute("left"));
        var scrollTop = parseInt(sym.getAttribute("top"));

        self.grid.zoom = zoom;
        self.grid.pageSize(width, height);
        self.grid.area.areaGlobal.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
        self.symbol.name = sym.getAttribute("symbolname");
        self.symbol.reference = sym.getAttribute("reference");
        self.symbol.description = sym.getAttribute("description");
        self.symbol.type = sym.getAttribute("type");
        self.symbol.model.name = sym.getAttribute("modelname");
        if(sym.getAttribute("destination"))
           self.symbol.destination= sym.getAttribute("destination");
        if(!sym.getAttribute("modelname"))
        {
          self.symbol.model={ type: "SPICE", name: "None"};
        }
        else        {
          self.symbol.model={ type: sym.getAttribute("modeltype"), name: sym.getAttribute("modelname")};
        }
		self.active();
		if((self.pageType!='sym')&&sym.getAttribute("optionsimulation"))
		  self.optionsimulation=self.optionsimulation=JSON.parse(sym.getAttribute("optionsimulation"));
        
        if(self.pageType!='sym')
          self.itProject=sym.getAttribute("itproject")=='true';
       

    try {  self.symbol.description  = JSON.parse(self.symbol.description);}
    catch(err) { self.symbol.description={webPage:'',info:''}; }

    }

    self.getSymbolDescription = function () {

        sym = document.getElementById("sym").firstChild;
        sym.setAttribute("width", self.grid.width);
        sym.setAttribute("height", self.grid.height);
        sym.setAttribute("zoom", self.grid.zoom);
        sym.setAttribute("left", self.grid.area.areaGlobal.scrollLeft);
        sym.setAttribute("top", self.grid.area.areaGlobal.scrollTop);
        sym.setAttribute("symbolname", self.symbol.name);
        sym.setAttribute("reference", self.symbol.reference);
        sym.setAttribute("description",JSON.stringify(self.symbol.description));
        sym.setAttribute("type", self.symbol.type);
        sym.setAttribute("modelname", self.symbol.model.name);
        sym.setAttribute("modeltype", self.symbol.model.type);
        sym.setAttribute("destination", self.symbol.destination);
		if(self.pageType!='sym'){
		sym.setAttribute("optionsimulation",JSON.stringify(self.optionsimulation));
        sym.setAttribute("itproject", self.itProject);
        }
    }

    self.getSymbol = function () {
        self.getSymbolDescription();
		plotsSaveDataLayoutInDiv();
        return document.getElementById("sym").innerHTML;
    }

    self.setSymbol = function (sym) {
        document.getElementById("sym").innerHTML = sym;
        self.modified = false;
        self.posUndo = 0;
        self.data = [{
                setDescription: 'New',
                symbol: sym
            }];
        self.setSymbolDescription();
		self.showPolarity=false;
		ItShowPolarity();
		if(self.objectInspector)
		 self.objectInspector.getDescriptionPage();
	    plotsOpenDataLayoutInDiv();
        modifiedClassText();
        updateHtmlCode();
        modifiedModelNameParts()
    }
//******************* "interface of description" or "Objec tInspector" *****************************/

self.getObjectInspector =function(div){


};

    self.newPage('sym');
    self.objectInspector=new fobjectInspector(self);


}

function exportAllDrawingData(drawingInstance) {

    //alert(drawingInstance.modified);
    
    return JSON.stringify({
        // البيانات الوصفية
        metadata: {
            symbol: drawingInstance.symbol,
            pageType: drawingInstance.pageType,
            path: drawingInstance.path,
            itProject: drawingInstance.itProject
        },
        
        // إعدادات المحاكاة
        simulation: drawingInstance.optionsimulation,
        modified: drawingInstance.modified,
        
        // تاريخ التعديلات
        history: drawingInstance.data,
        currentPosition: drawingInstance.posUndo,
        
        // الرسم الحالي كـ SVG
        svgContent: drawingInstance.getSymbol(),
        
        // قوائم إضافية
        pins: drawingInstance.pins,
        vars: drawingInstance.vars,
        filesPy: drawingInstance.filesPy,
        filesSy: drawingInstance.filesSy
    });
}


/**
 * استيراد جميع بيانات الرسم من JSON (العكسية لـ exportAllDrawingData)
 * param {Object} jsonData - كائن JSON تم تصديره بواسطة exportAllDrawingData
 * param {Object} drawingInstance - كائن fdrawing موجود
 * returns {boolean} - true إذا نجح الاستيراد
 */
function importAllDrawingData(savedString, drawingInstance) {



      jsonData=JSON.parse(savedString);
      if (!jsonData || !drawingInstance) {
        console.error("❌ البيانات أو كائن الرسم غير موجود");
        return false;
      }

      try {
     
        // ═══════════════════════════════════════
        // 1. metadata (pageType, symbol, path, inProject)
        // ═══════════════════════════════════════
        if (jsonData.metadata) {
            const meta = jsonData.metadata;
            
            // نوع الصفحة
            if (meta.pageType) {
                drawingInstance.pageType = meta.pageType;
            }
            
            // path
            if (meta.path !== undefined) {
                drawingInstance.path = meta.path;
            }
            
            
            // symbol
            if (meta.symbol) {
                const sym = meta.symbol;
                drawingInstance.symbol = {
                    fname: sym.fname || "NewFile.sym",
                    name: sym.name || "New",
                    model: {
                        name: sym.model.name || "None",
                        type: sym.model.type || "SPICE"
                    },
                    reference: sym.reference || "X",
                    description: sym.description || { webPage: '', info: '' },
                    destination: sym.destination || "local",
                    type: sym.type || "None"
                };
            }
        }

        // ═══════════════════════════════════════
        // 2. Options Simulation
        // ═══════════════════════════════════════
        if (jsonData.simulation) {
            drawingInstance.optionsimulation = jsonData.simulation;
        } else {
            drawingInstance.optionsimulation = drawingInstance.getOptionSimulation();
        }

        // ═══════════════════════════════════════
        // 3. Get pins, vars, filesPy, filesSy
        // ═══════════════════════════════════════
        drawingInstance.pins = jsonData.pins || [];
        drawingInstance.vars = jsonData.vars || [];
        drawingInstance.filesPy = jsonData.filesPy || [];
        drawingInstance.filesSy = jsonData.filesSy || [];

        // ═══════════════════════════════════════
        // 4.Get Svg Content and set it to drawing
        // ═══════════════════════════════════════
        if (jsonData.svgContent) {
            drawingInstance.setSymbol(jsonData.svgContent);
        }

        // ═══════════════════════════════════════
        // (Undo/Redo)
        // ═══════════════════════════════════════
    
        if (jsonData.history && Array.isArray(jsonData.history) && jsonData.history.length > 0) {
            drawingInstance.data = jsonData.history;
            drawingInstance.posUndo = jsonData.currentPosition || 0;
            
            // posUndo
            if (drawingInstance.posUndo >= drawingInstance.data.length) {
                drawingInstance.posUndo = drawingInstance.data.length - 1;
            }
            if (drawingInstance.posUndo < 0) {
                drawingInstance.posUndo = 0;
            }
        }

      
       drawingInstance.modified = jsonData.modified;
       drawingInstance.itCopyData();
       displayByPageType();
      
        return true;

      } catch (error) {
        console.error("Error importing data:", error);
        return false;
      }

      // ═══════════════════════════════════════

  }


//-------------------------------------------------creat page of drawing circuit or symbol-----------------------------------//
let drawing;
var typePyAMS=true;



function creatPage(div) {

    var d;
    function resizeCanvas() {
    var w = document.getElementById(div).offsetWidth - 20;
    var h = document.getElementById(div).offsetHeight - 20;

    d.setSize(w,h);
    }

    d = new fdrawing(div);
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    
	return d;
}

