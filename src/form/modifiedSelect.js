/*
#-------------------------------------------------------------------------------
# Name:         modifiedSelect.js
# Author:       d.fathi
# Created:      18/07/2021
# Last update:   17/05/2026
# Copyright:   (c)  DSpice 2026
# Licence:     free
#-------------------------------------------------------------------------------
*/

/*const { read } = require("original-fs");*/

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

function deleteEllipseMS(self) {
    for (var i = 0; i < self.ellps.length; i++) {
        var element = document.getElementById(self.ellps[i].id);
        element.parentNode.removeChild(element);
    }
    self.ellps = [];
}

//-------Page and symbol description   -----------------------------


function getDescription(self,elemSelect){
    self.drawing.objectInspector.getSelect(elemSelect);
}



function pageSelect() {

    defaultData = {
        header: { title: "Page design", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Page.width  (px)", type: "number", value: mtable.select.width },
                    { label: "Page.height (px)", type: "number", value: mtable.select.height }
                ]
            }
        ]
    };


    if(drawing.pageType=="sym"){
        defaultData.header.title = "Symbol design";
        defaultData.sections[0].title = "Symbol Properties";
        defaultData.sections[0].rows.push(
            { label: "Name", type: "text", value: drawing.symbol.name },
            { label: "Reference", type: "text", value: drawing.symbol.reference },  //, readonly: true
            { label: "Model.type", type: "dropdown", value: drawing.symbol.model.type, options: ['SPICE'] },
            { label: "Model.name", type: "dropdown", value: drawing.symbol.model.name, options: spiceElements }
        );
    }
  
    mtable.type = "page";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function pageModified() {
mtable.select.width = propertiesData.sections[0].rows[0].value;
mtable.select.height = propertiesData.sections[0].rows[1].value;
 if(drawing.pageType=="sym"){
    drawing.symbol.name = propertiesData.sections[0].rows[2].value;
    /*if(drawing.symbol.model.type != propertiesData.sections[0].rows[4].value){*/
        drawing.symbol.model.type = 'SPICE'; //propertiesData.sections[0].rows[4].value;
     
       /* pageSelect();
        return;
        
    }*/

    drawing.symbol.model.name = propertiesData.sections[0].rows[5].value;
    drawing.symbol.reference = propertiesData.sections[0].rows[3].value ? propertiesData.sections[0].rows[3].value : Ref[propertiesData.sections[0].rows[5].value];
    if (controlRefSymbol())
    {
        pageSelect();
        return;
    }
}

 


deleteEllipseMS(mtable.resize);
if (mtable.resize.setElement)
     mtable.resize.creatEllipse();
    //pageSelect();
}


//-------Rectangle description ---------------------------------------------------
function rectSelect() {

        defaultData = {
        header: { title: "Rectangle", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "rect";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedRect() {
    var rect = mtable.select;

    rect.setAttribute("width", propertiesData.sections[0].rows[0].value);
    rect.setAttribute("height", propertiesData.sections[0].rows[1].value);
    rect.setAttribute("x", propertiesData.sections[0].rows[2].value);
    rect.setAttribute("y", propertiesData.sections[0].rows[3].value);
    rect.style.stroke = propertiesData.sections[0].rows[4].color;
    rect.style.fill = propertiesData.sections[0].rows[5].color;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}

//-------Ellipse description ---------------------------------------------------

function ellipseSelect() {
        defaultData = {
        header: { title: "Ellipse", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Radius x axis", type: "number", value: parseInt(mtable.select.getAttribute("rx")) },
                    { label: "Radius y axis", type: "number", value: parseInt(mtable.select.getAttribute("ry")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("cx")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("cy")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "ellipse";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedEllipse() {
    var ellipse = mtable.select;
    ellipse.setAttribute("rx", propertiesData.sections[0].rows[0].value);
    ellipse.setAttribute("ry", propertiesData.sections[0].rows[1].value);
    ellipse.setAttribute("cx", propertiesData.sections[0].rows[2].value);
    ellipse.setAttribute("cy", propertiesData.sections[0].rows[3].value);
    ellipse.style.stroke = propertiesData.sections[0].rows[4].color;
    ellipse.style.fill = propertiesData.sections[0].rows[5].color;
   // ellipse.style.fillOpacity = propertiesData.sections[0].rows[5].opacity;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
       mtable.resize.creatEllipse();
}

//--arc description ---------------------------------------------------


function arcSelect() {
        defaultData = {
        header: { title: "Arc", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Radius x axis", type: "number", value: parseInt(mtable.select.getAttribute("rx")) },
                    { label: "Radius y axis", type: "number", value: parseInt(mtable.select.getAttribute("ry")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("cx")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("cy")) },
                    { label: "Start angle(°)", type: "number", value: getDeg(mtable.select.getAttribute("startangle")) },
                    { label: "End angle(°)", type: "number", value: getDeg(mtable.select.getAttribute("endangle")) },
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "arc";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedArc() {
    var arc = mtable.select;
    arc.setAttribute("rx", propertiesData.sections[0].rows[0].value);
    arc.setAttribute("ry", propertiesData.sections[0].rows[1].value);
    arc.setAttribute("cx", propertiesData.sections[0].rows[2].value);
    arc.setAttribute("cy", propertiesData.sections[0].rows[3].value);
    arc.setAttribute("startangle", propertiesData.sections[0].rows[4].value * 3.14 / 180);
    arc.setAttribute("endangle", propertiesData.sections[0].rows[5].value * 3.14 / 180);
    arc.style.stroke = propertiesData.sections[0].rows[6].color;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//---Polyline description ---------------------------------------------------

function polylineSelect() {
    defaultData = {
        header: { title: "Polyline", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "polyline";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function polylineModified() {
    mtable.select.style.stroke = propertiesData.sections[0].rows[0].color;
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
         mtable.resize.creatEllipse();
}

//--Polygon description ---------------------------------------------------


function polygonSelect() {
    defaultData = {
        header: { title: "Polygon", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: "Fill", type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: "Style", type: "Button", value: 'CSS Code', setClick:'openEditCSS()' }
                ]
            }
        ]
    };

    mtable.type = "polygon";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function polygonModified() {
    mtable.select.style.stroke = propertiesData.sections[0].rows[0].color;
    mtable.select.style.fill = propertiesData.sections[0].rows[1].color;
    modifiedEvent();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
         mtable.resize.creatEllipse();
}
//--Net description ---------------------------------------------------

/*
function netSelect() {
    mtable.typeSelect = 'net';
    if(!mtable.select.getAttribute("diagonal"))
       mtable.select.setAttribute("diagonal",'false');
    mtable.table = [{
            name: "Stroke",
            value: rgb2hex(mtable.select.style.stroke),
            type: "color"
        }, {
            name: 'Reference',
            value: mtable.select.getAttribute("ref"),
            type: "text"
        }, {
           name: 'Diagonal',
           value: mtable.select.getAttribute("diagonal"),
           type: "select",
           array: ['true','false']

       }
    ]
}  //Diagonal

function netModified(pos,e) {

    var px = mtable.px;
    switch (pos) {
    case 0:
        mtable.select.setAttribute("setcolor", e.value);
        mtable.select.setAttribute("parentcolor", true);
        getNetRef();
        refSelectedColorNet(mtable.select);
        refNetWithPart();
        break;
    case 1:
        mtable.select.setAttribute("setref", e.value);
        mtable.select.setAttribute("parent", true);
        refNetWithPart();
        break;
    case 2:
          mtable.select.setAttribute("diagonal", e.value);
        break;
    }

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
        mtable.resize.creatEllipse();
}
*/

function netSelect() {
    defaultData = {
        header: { title: "Net", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Stroke", type: "color", value: rgb2hex(mtable.select.style.stroke), color: rgb2hex(mtable.select.style.stroke) },
                    { label: 'Reference', type: "text", value: mtable.select.getAttribute("ref") },
                    { label: 'Diagonal',  type: "dropdown", value: mtable.select.getAttribute("diagonal"), options: ['false', 'true'] }
                ]
            }
        ]
    };

    mtable.type = "net";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}   

function netModified() {
    
    
    mtable.select.setAttribute("diagonal", propertiesData.sections[0].rows[2].value);
    getNetRef();
    if(rgb2hex(mtable.select.style.stroke) != propertiesData.sections[0].rows[0].color) {
         mtable.select.setAttribute("setcolor", propertiesData.sections[0].rows[0].color);
        mtable.select.setAttribute("parentcolor", true);
        refSelectedColorNet(mtable.select);
    }

    if(mtable.select.getAttribute("ref")!=propertiesData.sections[0].rows[1].value){
        mtable.select.setAttribute("parent", true);
        mtable.select.setAttribute("setref", propertiesData.sections[0].rows[1].value);
        refNetWithPart();
    }
    
    deleteEllipseMS(mtable.resize);
        if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//-------Reference description-------------------------------------

function refSelected() {
   
    defaultData = {
        header: { title: "Reference", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Reference', type: "text", value: mtable.select.textContent }
                ]
            }
        ]
    };  

    mtable.type = "ref";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function refModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    mtable.select.textContent = propertiesData.sections[0].rows[5].value;

    if(controlRefPart(mtable.select))
        refSelected();

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        
        mtable.resize.creatEllipse();
}



//-------Paramater description-------------------------------------


function paramSelected() {
    mtable.select.p = mtable.select.textContent.split("=");
    defaultData = {
        header: { title: "Parameter", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Show', type: "dropdown", value: mtable.select.getAttribute("show"), options: ['Name and value', 'Value only'] }
                ]
            }
        ]
    };
if(mtable.select.getAttribute("show")=='Name and value'){
    defaultData.sections[0].rows.push(
        { label: 'Name', type: "text", value: mtable.select.getAttribute("paramname") },
        { label: 'Value', type: "text", value: mtable.select.getAttribute("paramvalue")}
    );
} else{
    defaultData.sections[0].rows.push(
        { label: 'Value', type: "text", value: mtable.select.getAttribute("paramvalue")}
    );
}
    mtable.type = "param";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function paramModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    var showValue = propertiesData.sections[0].rows[5].value;

    if(mtable.select.getAttribute("show")!=showValue){
        mtable.select.setAttribute("show", showValue);
        mtable.select.textContent = showValue=='Name and value' ? mtable.select.getAttribute("paramname") + '=' + mtable.select.getAttribute("paramvalue") : mtable.select.getAttribute("paramvalue");
        paramSelected();
        return;
    }

    if(showValue=='Name and value' ){
        mtable.select.setAttribute("paramname", propertiesData.sections[0].rows[6].value);
        mtable.select.setAttribute("paramvalue", propertiesData.sections[0].rows[7].value);
        var text = propertiesData.sections[0].rows[6].value + '=' + propertiesData.sections[0].rows[7].value;
    } else{
        mtable.select.setAttribute("paramvalue", propertiesData.sections[0].rows[6].value);
        var text = propertiesData.sections[0].rows[6].value;
    }

    mtable.select.textContent = text;
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
} 

//-------Model description-------------------------------------

function modelSelected() {
   
    defaultData = {
        header: { title: "Model", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Model.name', type: "dropdownedit", value: mtable.select.getAttribute("modelname"),options: mtable.select.getAttribute("modellist").split(',')},
                    { label: 'Model.list', type: "Button", value: 'Add similar', setClick:'openEditorListModels()' },
                ]
            }
        ]
    };  
 
    mtable.type = "modelSpice";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modelModified() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[3].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[4].color;
    mtable.select.textContent = propertiesData.sections[0].rows[5].value;
    mtable.select.setAttribute("modelname",propertiesData.sections[0].rows[5].value);

   // if(controlRefPart(mtable.select))
    //    refSelected();

    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        
        mtable.resize.creatEllipse();
}

//-------Pin description ---------------------------------------------------

function pinSelect() {
    var r = getPinDescription(mtable.select)
        if (!mtable.select.childNodes[2].style.fill)
            mtable.select.childNodes[2].style.fill = 'RGB(0,0,0)';
    defaultData = {
        header: { title: "Pin", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Size', type: "number", value: parseInt(getPinDescription(mtable.select).size), condition: [['min', '3'], ['max', '25']] },
                    { label: 'Rotation', type: "dropdown", value: r.rotation, options: ['0°', '90°', '180°', '270°'] },
                    { label: 'Pos.x', type: "number", value: parseInt(r.x) },
                    { label: 'Pos.y', type: "number", value: parseInt(r.y) },
                    { label: 'Name', type: "text", value: r.text },
                    { label: 'Name.display', type: "dropdown", value: mtable.select.childNodes[2].style.display, options: ["none", "block"] },
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.childNodes[2].style.fontSize) },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.childNodes[2].style.fontFamily, options: fontAvailable },
                    { label: 'Font.color', type: "color", value: rgb2hex(mtable.select.childNodes[2].style.fill), color: rgb2hex(mtable.select.childNodes[2].style.fill) },
                    { label: 'Type', type: "dropdown", value: mtable.select.getAttribute("type"), options: ["simple", "dot", "clk", "dotclk", "input", "output"] },
                    { label: 'Polarity', type: "dropdown", value: r.polarity, options: ["positive", "negative", "mixed"] },
                    { label: 'Stroke', type: "color", value: rgb2hex(mtable.select.childNodes[0].style.stroke), color: rgb2hex(mtable.select.childNodes[0].style.stroke) }
                ]
            }
        ]
    };

    mtable.type = "pin";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedPin() {
    var pin = mtable.select;
    var points = getArrayPoints(mtable.select);
    function sign(a, b) {
        if (a > b)
            return 1;
        else if (a < b)
            return -1;
        else
            return 0;
    }
    var size = propertiesData.sections[0].rows[0].value;
    if (points[0].y == points[1].y)
        points[1].x = points[0].x + sign(points[1].x, points[0].x) * size;
    else if (points[0].x == points[1].x)
        points[1].y = points[0].y + sign(points[1].y, points[0].y) * size;
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
    switch (propertiesData.sections[0].rows[1].value) {
    case '0°':
        points[1].y = points[0].y;
        points[1].x = points[0].x + size;
        propertiesData.sections[0].rows[1].value = '0°';
        break;
    case '90°':
        points[1].x = points[0].x;
        points[1].y = points[0].y + size;
        propertiesData.sections[0].rows[1].value = '90°';
        break;
    case '180°':
        points[1].y = points[0].y;
        points[1].x = points[0].x - size;
        propertiesData.sections[0].rows[1].value = '180°';
        break;
    case '270°':
        points[1].x = points[0].x;
        points[1].y = points[0].y - size;
        propertiesData.sections[0].rows[1].value = '270°';
        break;
    }           
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));
    mtable.select.childNodes[2].textContent = propertiesData.sections[0].rows[4].value;
    mtable.select.childNodes[2].style.display = propertiesData.sections[0].rows[5].value;
    mtable.select.childNodes[2].style.fontSize = propertiesData.sections[0].rows[6].value;
    mtable.select.childNodes[2].style.fontFamily = propertiesData.sections[0].rows[7].value;
    mtable.select.childNodes[2].style.fill = propertiesData.sections[0].rows[8].color;
    mtable.select.setAttribute("type", propertiesData.sections[0].rows[9].value);
    mtable.select.childNodes[3].textContent = getPolyText(propertiesData.sections[0].rows[9].value);
    mtable.select.childNodes[0].style.stroke = propertiesData.sections[0].rows[11].color;

    var points = getArrayPoints(mtable.select);
    var dx = points[1].x - points[0].x;
    var dy = points[1].y - points[0].y;
    points[0].x = parseInt(propertiesData.sections[0].rows[2].value);
    points[0].y = parseInt(propertiesData.sections[0].rows[3].value);
    points[1].x = points[0].x + dx;
    points[1].y = points[0].y + dy;
    mtable.select.setAttribute("points", polylineToAttribute(points, 0, 0));

    drawingPin(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}

//-------Probe  description----------------------------------------------------------------


function probeSelect() {
    defaultData = {
        header: { title: "Probe", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "OP", type: "Button", value: 'Run ▶', setClick: 'ioProbe()' },
                    { label: "Select signal", type: "Button", value: 'Show list', setClick: 'ioPosProbe()' }           
                ]
            }
        ]
    };

    mtable.type = "probe";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function probeModified() {

    mtable.select.setAttribute("x", propertiesData.sections[0].rows[0].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[1].value);
    structProbe(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}


//-------codeHTML description ---------------------------------------------------
function codeHTMLSelect() {


    var f=mtable.select.firstChild.firstChild.style;

    defaultData = {
        header: { title: "Code HTML", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Font.size", type: "number", value: parseInt(f.fontSize) },
                    { label: "Font.family", type: "dropdown", value: f.fontFamily, options: fontAvailable },
                    { label: "Font.color", type: "color", value: rgb2hex(f.color), color: rgb2hex(f.color) },
                    { label: "Background", type: "color", value: rgb2hex(f.backgroundColor), color: rgb2hex(f.backgroundColor) },
                    { label: "HTML code", type: "Button", value: 'Show', setClick: 'openEditHtml()' }         
                ]
            }
        ]
    };

    mtable.type = "codeHTML";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedcodeHTML() {

    mtable.select.setAttribute("x", propertiesData.sections[0].rows[0].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[1].value);
    mtable.select.setAttribute("width", propertiesData.sections[0].rows[2].value);
    mtable.select.setAttribute("height", propertiesData.sections[0].rows[3].value);
    var f=mtable.select.firstChild.firstChild.style;
    f.fontSize = propertiesData.sections[0].rows[4].value + "px";
    f.fontFamily = propertiesData.sections[0].rows[5].value;
    f.color = propertiesData.sections[0].rows[6].color;
    f.backgroundColor = propertiesData.sections[0].rows[7].color;
    modifedSizeCodeHtml(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}


//--



//-------Text description ---------------------------------------------------
//https://htmldog.com/references/css/properties/font-weight/
/**/

function setPosText() {
    var x = mtable.select.getAttribute("x");
    var y = mtable.select.getAttribute("y");
    var r = mtable.select.getAttribute("r");
    mtable.select.setAttribute('transform', 'rotate(' + r + ' ' + x + ' ' + y + ')');
}

function textSelect(){
    defaultData = {
        header: { title: "Text", subtitle: "Selected" },
        sections: [ {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: 'Font.size', type: "number", value: parseInt(mtable.select.style.fontSize) },
                    { label: 'Font.weight', type: "dropdown", value: mtable.select.style.fontWeight, options: ['normal', 'bold', 'lighter', 'bolder'] },
                    { label: 'Font.style', type: "dropdown", value: mtable.select.style.fontStyle, options: ['normal', 'italic', 'oblique'] },
                    { label: 'Font.family', type: "dropdown", value: mtable.select.style.fontFamily, options: fontAvailable },
                    { label: 'Pos.x', type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: 'Pos.y', type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: 'Rotation', type: "dropdown", value: mtable.select.getAttribute("r") + "°", options: ['0°', '90°'] },
                    { label: 'Fill', type: "color", value: rgb2hex(mtable.select.style.fill), color: rgb2hex(mtable.select.style.fill) },
                    { label: 'Text', type: "text", value: mtable.select.textContent },
                    { label: 'Stroke.used', type: "dropdown", value: mtable.select.style.stroke ? 'true' : 'false', options: ['false', 'true'] },
                    { label: 'Stroke.width', type: "number", value: mtable.select.style.strokeWidth}
                ]
             }
        ]
     };

    mtable.type = "text";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedText() {

    mtable.select.style.fontSize = propertiesData.sections[0].rows[0].value;
    mtable.select.style.fontFamily = propertiesData.sections[0].rows[1].value;
    mtable.select.style.fontStyle = propertiesData.sections[0].rows[2].value;
    mtable.select.style.fontWeight = propertiesData.sections[0].rows[3].value;
    mtable.select.setAttribute("r", propertiesData.sections[0].rows[6].value.replace('°', ''));
    mtable.select.setAttribute("x", propertiesData.sections[0].rows[4].value);
    mtable.select.setAttribute("y", propertiesData.sections[0].rows[5].value);
    mtable.select.style.fill = propertiesData.sections[0].rows[7].color;
    mtable.select.textContent = propertiesData.sections[0].rows[8].value;
    if(propertiesData.sections[0].rows[9].value=='true' && !mtable.select.style.stroke)
        mtable.select.style.stroke='#000000';
    else if(propertiesData.sections[0].rows[9].value=='false' && mtable.select.style.stroke)
        mtable.select.style.stroke=null;
    mtable.select.style.strokeWidth = propertiesData.sections[0].rows[10].value;
    setPosText();
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();
}


//-------codePy description ---------------------------------------------------
function codePySelect() {

        defaultData = {
        header: { title: "CodePy", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Width  (px)", type: "number", value: parseInt(mtable.select.getAttribute("width")) },
                    { label: "Height (px)", type: "number", value: parseInt(mtable.select.getAttribute("height")) },
                    { label: "Pos.x", type: "number", value: parseInt(mtable.select.getAttribute("x")) },
                    { label: "Pos.y", type: "number", value: parseInt(mtable.select.getAttribute("y")) },
                    { label: "CodePy", type: "Button", value: 'Show Model', setClick:'openEditCodePy()' }
                ]
            }
        ]
    };

    mtable.type = "codePy";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();


}

function modifiedcodePy() {

  var codePy_= mtable.select;

    codePy_.setAttribute("width", propertiesData.sections[0].rows[0].value);
    codePy_.setAttribute("height", propertiesData.sections[0].rows[1].value);
    codePy_.setAttribute("x", propertiesData.sections[0].rows[2].value);
    codePy_.setAttribute("y", propertiesData.sections[0].rows[3].value);


    modifedSizeCodePy(mtable.select);
    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)
     mtable.resize.creatEllipse();
}


function partSelect() {
    var part = mtable.select;

    if(mtable.select.getAttribute("directory")=='standard'){
         defaultData = {
        header: { title: "Part", subtitle: "Selected" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Symbol.name", type: "text", value: part.firstChild.getAttribute("symbolname"), readonly: true },
                    { label: "Symbol.file", type: "text", value: part.getAttribute("directory"), readonly: true }
                ]
            }
        ]
    };
    }else{
    defaultData = {
        header: { title: "Part", subtitle: "Selected" },
        sections: [
            {
                title: "Symbol Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: part.firstChild.getAttribute("symbolname"), readonly: true },
                    { label: "File", type: "text", value: part.getAttribute("symbolfile"), readonly: true },
                    { label: "Directory", type: "text", value: part.getAttribute("directory") },
                    { label: "Local library", type: "text", value: part.getAttribute("liblocale"), readonly: true },
                    { label: "Reference", type: "text", value: part.getAttribute("sref") }
                ]
            },
                        {
                title: "Model Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "Name", type: "text", value: part.getAttribute("model"), readonly: true }
                   // { label: "Parameters", type: "Button", value: 'show', setClick: 'showParams()' },
                   // { label: "File", type: "Button", value: 'show', setClick: 'openEditor("' + part.getAttribute("model") + '","' + part.getAttribute("directory") + '")' }
                ]
            }
        ]
    };
    }

    var elem=getPartModel(part);

    if(elem){
         defaultData.sections[1].rows.push(
            {label: "Model", type: "dropdownedit", value: elem.getAttribute("modelname"), options: elem.getAttribute("modellist").split(',')}
         );
    }

    mtable.type = "part";
    mtable.model=data[0];
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();
}

function modifiedPart() {
    console.log("modified part");
    var part = mtable.select;
    
    part.setAttribute("directory", propertiesData.sections[0].rows[2].value);
    part.setAttribute("sref", propertiesData.sections[0].rows[4].value);

    if(mtable.model){
            var elem=getPartModel(part);

    if(elem){
        elem.setAttribute("modelname", propertiesData.sections[1].rows[1].value);
        elem.textContent=propertiesData.sections[1].rows[1].value;
    }
}
    
    if( controlPartRef(part)){
        partSelect();
        return;
    } 


    deleteEllipseMS(mtable.resize);
    if (mtable.resize.setElement)        mtable.resize.creatEllipse();

}

//-------analysis description ---------------------------------------------------

function colorOutput(n,e){
    return;
    console.log(n, e.value);
	var analy=JSON.parse(elem.getAttribute("description"));

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

	if(n==-1)
	{
		x.color=e.value;
	}
	else {
		r[n].color=e.value;
	}
	elem.setAttribute("description", JSON.stringify(analy));
}

function removeOutput(n){
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

	if(n==-1)
	{
		x.used=false;
	}
	else {
		r.splice(n, 1);
	}
	mtable.select.setAttribute("description", JSON.stringify(analy));
	analysisSelect();
}





function analysisSelect() {

        var analy=JSON.parse(mtable.select.getAttribute("description"));


    //Analysis Properties-----------------------------------------------------------------------------------------------------
        defaultData = {
        header: { title: "Analysis Description", subtitle: "Selected" },
        sections: [
            { title: "Analysis Properties",
              collapsed: false,
              showReset: true,
                rows: [ { label: 'Type', type: "dropdown", value: analy.type, options: ['DC Sweep', 'Time Domain','AC Analysis'] },
                        { label: 'Simulation', type: "Button", value: 'Run ▶', setClick: 'runAnalysis()' }] 
            }
        ]
    };

    if(analy.type=='DC Sweep'){
      var dc=analy.dcsweep;
      defaultData.sections.push({ title: "DC Sweep Properties", collapsed: false, showReset: true, rows: [] });
      defaultData.sections[1].rows.push( { label: 'Paramater', type: "Button", value: dc.param, setClick: 'getParamAnalysis("dc","'+dc.param+'")' });
      defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: dc.start });
      defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: dc.step });
      defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: dc.stop });

      var r=dc.yAxe.outputs;
	  var x=dc.xAxe;

    } else if(analy.type=='Time Domain') {
        var tr=analy.time
        defaultData.sections.push({ title: "Time Domain Properties", collapsed: false, showReset: true, rows: [] });
        defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: tr.start });
        defaultData.sections[1].rows.push( { label: 'Step', type: "text", value: tr.step });
        defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: tr.stop });

        var r=tr.yAxe.outputs;
        var x=tr.xAxe;

    } else if(analy.type=='AC Analysis') {
        var ac=analy.ac;
        defaultData.sections.push({ title: "AC Analysis Properties", collapsed: false, showReset: true, rows: [] });
        defaultData.sections[1].rows.push( { label: 'Start', type: "text", value: ac.start });
        defaultData.sections[1].rows.push( { label: 'Stop', type: "text", value: ac.stop });
        defaultData.sections[1].rows.push( { label: 'Points', type: "text", value: ac.points });
        defaultData.sections[1].rows.push( { label: 'Sweep', type: "dropdown", value: ac.sweep, options: ['linear', 'decade', 'octave'] });

        var r=ac.yAxe.outputs;
        var x=ac.xAxe;

    }


   

	
    // Y axe property-----------------------------------------------------------------------------------
    defaultData.sections.push({ title: "Y axe property", collapsed: false, showReset: true, rows: [] });
    for(var i=0;i<r.length;i++){
        if(r[i].func)
            var func='  :' +r[i].func;
        else
            var func='';
        defaultData.sections[2].rows.push( { label: r[i].name +  func, type: "axeproperty", value: r[i].color, color: r[i].color, setChange: 'colorOutput('+i+',this)', setClick: 'removeOutput('+i+')' });
    }
    defaultData.sections[2].rows.push({ label: 'Add output', type: "Button", value: 'Add', setClick: 'getParamAnalysis(0,0)' });
    
    // X axe prpperty-----------------------------------------------------------------------------------
    defaultData.sections.push({ title: "X axe property", collapsed: false, showReset: true, rows: [] });
     if(x.func)
            var func='  :' +x.func;
     else
            var func='';
    if(x.used)defaultData.sections[3].rows.push({ label: x.name+ func, type: "axeproperty", value: x.color, color: x.color, setChange: 'colorOutput(-1,this)' , setClick: 'removeOutput(-1)' });
    defaultData.sections[3].rows.push({ label: 'Add X axe', type: "Button", value: x.used?'Modify':'Add', setClick: 'getParamAnalysis(1,0)' });

    
    var elem= mtable.select.lastChild.firstChild;
    var layout = JSON.parse(elem.getAttribute("layout"));
    //alert(layout.yaxis.showgrid);
/*
    defaultData.sections.push({ title: "Layout", collapsed: true, showReset: true, rows: [] });
    defaultData.sections[4].rows.push( { label: 'Title', type: "text", value: layout.title.text });
    defaultData.sections[4].rows.push( { label: 'Font.color', type: "color", value: layout.font.color, color: layout.font.color });
    defaultData.sections[4].rows.push( { label: 'Font.size', type: "number", value: layout.font.size });
    defaultData.sections[4].rows.push( { label: 'Font.family', type: "dropdown", value: layout.font.family, options: fontAvailable });
    defaultData.sections[4].rows.push( { label: 'Background (Tab)', type: "color", value: layout.paper_bgcolor, color: layout.paper_bgcolor });
    defaultData.sections[4].rows.push( { label: 'Background (Plot)', type: "color", value: layout.plot_bgcolor, color: layout.plot_bgcolor });
    defaultData.sections[4].rows.push( { label: 'Bordercolor', type: "color", value: layout.bordercolor, color: layout.bordercolor });
    defaultData.sections[4].rows.push( { label: 'Axis.grid.color', type: "color", value: layout.yaxis.gridcolor, color: layout.yaxis.gridcolor });
    defaultData.sections[4].rows.push( { label: 'Axis.grid.show', type: "dropdown", value: layout.yaxis.showgrid+"", options: ['false', 'true'] });
    defaultData.sections[4].rows.push( { label: 'Legend.show', type: "dropdown", value: layout.showlegend+"", options: ['false', 'true']});

    defaultData.sections.push({ title: "Grid rows", collapsed: true, showReset: true, rows: [] });

    defaultData.sections[5].rows.push( { label: 'Rows' , type: "dropdown", value:  layout.grid.rows+"", options: ['1', '2', '3', '4', '5', '6']});
    defaultData.sections[5].rows.push( { label: 'Cols' , type: "dropdown", value:  layout.grid.cols+"", options: ['1', '2', '3', '4', '5', '6']});

    var pos=['1'];
    for(var i=2; i<=layout.grid.rows*layout.grid.cols; i++){
        pos.push(i+'');
    }

    for(var i=0;i<r.length;i++){
        defaultData.sections[5].rows.push( { label: 'Pos ['+r[i].name+']' , type: "dropdown", value: r[i].pos, options:pos});
    }
  */


    mtable.type = "analysis";
    propertiesData = JSON.parse(JSON.stringify(defaultData));
    buildPanel();

}

function modifiedAnalysis() {
        var analy=JSON.parse(mtable.select.getAttribute("description"));
        if(analy.type!=propertiesData.sections[0].rows[0].value){
            analy.type=propertiesData.sections[0].rows[0].value;
            mtable.select.setAttribute("description", JSON.stringify(analy));
            analysisSelect();
            return;
        }

        if(analy.type=='DC Sweep'){
            analy.dcsweep.param=propertiesData.sections[1].rows[0].value;
            analy.dcsweep.start=propertiesData.sections[1].rows[1].value;
            analy.dcsweep.step=propertiesData.sections[1].rows[2].value;
            analy.dcsweep.stop=propertiesData.sections[1].rows[3].value;
        } else if(analy.type=='AC Analysis'){
            analy.ac.start=propertiesData.sections[1].rows[0].value;
            analy.ac.stop=propertiesData.sections[1].rows[1].value;
            analy.ac.points=propertiesData.sections[1].rows[2].value;
            analy.ac.sweep=propertiesData.sections[1].rows[3].value;
            analy.ac.type = {
                linear: 'lin',
                decade: 'dec',
                octave: 'oct'   
            }[propertiesData.sections[1].rows[3].value] || 'lin';
        } else if(analy.type=='Time Domain'){
            analy.time.start=propertiesData.sections[1].rows[0].value;
            analy.time.step=propertiesData.sections[1].rows[1].value;
            analy.time.stop=propertiesData.sections[1].rows[2].value;
        }


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


        for(var i=0;i<r.length;i++){
         r[i].color=propertiesData.sections[2].rows[i].color;
    }

/*
        var elem= mtable.select.lastChild.firstChild;
        var data = JSON.parse(elem.getAttribute("data"));
        var layout = JSON.parse(elem.getAttribute("layout"));
        layout.title.text=propertiesData.sections[4].rows[0].value;
        layout.font.color=propertiesData.sections[4].rows[1].value;
        layout.font.size=propertiesData.sections[4].rows[2].value;
        layout.font.family=propertiesData.sections[4].rows[3].value;
        layout.paper_bgcolor=propertiesData.sections[4].rows[4].value;
        layout.plot_bgcolor=propertiesData.sections[4].rows[5].value;
        layout.bordercolor=propertiesData.sections[4].rows[6].value;
        layout.yaxis.gridcolor=propertiesData.sections[4].rows[7].value;
        layout.xaxis.gridcolor=propertiesData.sections[4].rows[7].value;
        layout.yaxis.showgrid=propertiesData.sections[4].rows[8].value=='true';
        layout.xaxis.showgrid=propertiesData.sections[4].rows[8].value=='true';
        layout.showlegend=propertiesData.sections[4].rows[9].value=='true';

       var p=propertiesData.sections[5];
       if((layout.grid.rows!=p.rows[0].value)||(layout.grid.columns!=p.rows[1].value)){
         layout.grid.rows=p.rows[0].value*1;
         layout.grid.columns=p.rows[1].value*1;

         elem.setAttribute("layout", JSON.stringify(layout));
         elem.setAttribute("data", JSON.stringify(data));
         Plotly.newPlot(elem, data, layout, plotConfig);
          mtable.select.setAttribute("description", JSON.stringify(analy));
          analysisSelect();
       }



        var r=analy.yAxe.outputs;
     
        for(var i=0; i<r.length; i++){
            r[i].pos=propertiesData.sections[5].rows[i+2].value;
        }

        for(var i=2; i<=layout.grid.rows*layout.grid.cols; i++){
            layout['yaxis'+i]={gridcolor:layout.yaxis.gridcolor,showgrid:layout.yaxis.showgrid};
            layout['xaxis'+i]={gridcolor:layout.xaxis.gridcolor,showgrid:layout.xaxis.showgrid,title:{'text':''}};
        }
*/
   //     elem.setAttribute("layout", JSON.stringify(layout));
   //     elem.setAttribute("data", JSON.stringify(data));
   //     Plotly.newPlot(elem, data, layout, plotConfig);
        mtable.select.setAttribute("description", JSON.stringify(analy));
    
}




