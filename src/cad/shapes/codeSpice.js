/*
#--------------------------------------------------------------------------------------------
# Name:        codeSpice.js
# Author:      d.fathi
# Created:     27/08/2024
# Update:      29/08/2024
# Copyright:   (c) DSpice 2026
# Licence:     free
#--------------------------------------------------------------------------------------------
*/


 const spiceElements = ['None', 'Resistor', 'Capacitor','Inductor','Voltage Source','Current Source','Transmission Line','Diode','BJT(NPN)','BJT(PNP)','MOSFET(N)','MOSFET(P)','Subckt'];
 const Ref={'None':'X','Resistor':'R','Capacitor':'C','Inductor':'L','Voltage Source':'V','Current Source':'I','Transmission Line':'T','Diode':'D','BJT(NPN)':'Q','BJT(PNP)':'Q','MOSFET(N)':'M','MOSFET(P)':'M','Subckt':'X'};
 const twoTerminal = ['Resistor', 'Capacitor','Inductor','Voltage Source','Current Source','Diode']; 

//-------------------------Class and function for resize shapes------------------------//
function addCodeSpice(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML ='<div  name="spiceCode" style="font-size: 8px; background-color: #ffffff;    margin-top:-10px; color: #000000;  font-family: Consolas;" code=";Spice code"> <h1>;Spice code</p> </div>';
    newElement.firstChild.style.height =200+'px';
    newElement.firstChild.style.width =222+'px';
    elem.appendChild(newElement);
}

function modifedSizeCodeSpice(element) {
    if (element.getAttribute("name") == "codeSpice") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"));
        var h = parseInt(element.getAttribute("height"));
        element.setAttribute('transform', "translate(" + x + "," + y + ")");
        element.firstChild.style.height=h+'px';
        element.firstChild.style.width=w+'px';
        element.firstChild.firstChild.style.height=h+'px';
		    element.firstChild.firstChild.style.width=w+'px';
    }
}



function updateCodeSpice(){
  var s=document.getElementsByName('spiceCode');
  var i=0;
  while (i <= s.length-1) {
    s[i].innerHTML= s[i].getAttribute("code");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,s[i]]);
   i++;
 }
}

function colorToSpiceText(text){
  var temp=text.split('\n');
  for(var i=0; i<temp.length; i++)
    {
      
     var a=temp[i]+'  ';
      if(a[0]==';')
        temp[i]="<i style='color:RGB(198, 100,0)'>"+temp[i]+"</i>";
      else if(a[0]=='*')
        temp[i]="<i style='color:RGB(198, 100,0)'>"+temp[i]+"</i>";
      else if (a[0]=='.')
      {
        var a=a.split(' ');
        if(a[0]=='.model' && a.length>=2)
          a[1]="<b style='color:RGB(0, 255,0)'>"+a[1]+"</b>";
          a[0]="<b style='color:RGB(0, 0,255)'>"+a[0]+"</b>";
        temp[i]=a.join(' ');
      }
     
    }

  return '<h1></h1><p>'+temp.join('<br>')+'</p>';
}

function setCodeSpice(text){
  
  mtable.select.firstChild.firstChild.setAttribute("code",text[0]);
  mtable.select.firstChild.firstChild.innerHTML=colorToSpiceText(text[0]);
 // updateCodeSpice();
}

function getSpicefromAttr() { 
  window.foo.getCodeSpice(mtable.select.firstChild.firstChild.getAttribute("code"));
}



function codeSpiceList() {
   var list = [];
   var s=document.getElementsByName('spiceCode');
   for(var i=0; i<s.length; i++)
       list.push(s[i].getAttribute("code"));
   return list;
}

function getElementListSpice() {
  console.log("getElementListSpice called");
  var list = [];
  var nodes=getNetRefs();
  if(nodes.length>0){
    list.push({ name: 'Node', voltages: []});
    nodes.forEach(node => {
     list[0].voltages.push('V(' + node + ')');
    });
  }
  var s=document.getElementsByName('part');
  console.log("Found " + s.length + " elements with name 'modeltype'");
  for(var i=0; i<s.length; i++){
    var part=s[i];
    var ref=part.getAttribute("sref");
    var modeltype=part.firstChild.getAttribute("modeltype");
    var modelname=part.firstChild.getAttribute("modelname");
    console.log(modelname);
    console.log(modeltype);
    if(modeltype=='SPICE' && modelname!='None') {
    list.push({ name: modelname+' ('+ref+')', voltages:[], currents: [] });
    var data = list[list.length - 1];

    if( twoTerminal.includes(modelname)){
        data.voltages.push('V(' + ref+ ')' );
        data.currents.push('I(' + ref+ ')' );
    }

    var pins = getListPins(part);
    pins.forEach(pin => {
      console.log("  Pin: " + pin.elem.childNodes[2].textContent );
      data.voltages.push('V(' + ref+ '.' + pin.elem.childNodes[2].textContent + ')' );
      data.currents.push('I(' + ref+ '.' + pin.elem.childNodes[2].textContent + ')' );
    })
   };
  }

  console.log("Element list: ", list);
  return list;
}


function getEleForDCAnalys() {
  console.log("getElementListSpice called");
  var list = [
      { name: 'source',  groups: [{ type: 'voltage', label: 'Voltage', items: [] },{ type: 'current', label: 'Current', items: [] }]},
      { name: 'Resistor', items: [] },
      { name: 'param', items: ['Temp'] }
    ];
 
  var s=document.getElementsByName('part');
  for(var i=0; i<s.length; i++){
    var part=s[i];
    var ref=part.getAttribute("sref");
    var modeltype=part.firstChild.getAttribute("modeltype");
    var modelname=part.firstChild.getAttribute("modelname");
    console.log(modelname);
    console.log(modeltype);
    if(modeltype=='SPICE' && modelname=='Voltage Source') {
      list[0].groups[0].items.push(ref);
   } else if(modeltype=='SPICE' && modelname=='Current Source') {
      list[0].groups[1].items.push(ref);
   } else if(modeltype=='SPICE' && modelname=='Resistor') {
      list[1].items.push(ref);
   };
  }

  console.log("Element list: ", list);
  return list;
}

//-------------------------End of Class and function for resize shapes------------------------//

function netListPins(part) {

    var pins = getListPins(part);
    var listPinsName = [];

    for (var i = 0; i < pins.length; i++)
        if (pins[i].elem.childNodes[1].style.display == "none") {
            var netId = pins[i].elem.getAttribute('netId');
            var elemNet = document.getElementById(netId);
            listPinsName.push(elemNet.getAttribute("ref"));
        } else
            listPinsName.push('0');
    return listPinsName;
}

function getListParams(part) {
    

      var paramList = [];
      var collection = part.children;

      var data=getPartModel(part);

      if(data[0]){
        return [data[1]];
      }
        for (var i = 0; i < collection.length; i++)
            if (collection[i].getAttribute("name") == "param")
                paramList.push(collection[i].textContent);
    
        return paramList;

}



function netList() {

    var parts = document.getElementsByName('part');
    var list = [];
    for (var i = 0; i < parts.length; i++)
        if (!strToBool(parts[i].firstChild.getAttribute('std'))) {
            list.push({
                part: parts[i],
                model: parts[i].getAttribute('model'),
                type: parts[i].firstChild.getAttribute('modeltype'),
                ref: parts[i].getAttribute('sref'),
                directory: parts[i].getAttribute('directory'),
                pins: netListPins(parts[i]),
                pinsName: getListPins(parts[i]).map(pin => pin.elem.childNodes[2].textContent),
                params: getListParams(parts[i])
            });

        }
    return list;
}

function parseSignal(signal, nodes = []) {
    // Regular expression to extract the type, component, and pin (if exists)
    const regex = /^([IV])\(([^.]+)(?:\.([^\)]+))?\)$/;
    const match = signal.match(regex);

    if (!match) {
        throw new Error("Invalid signal format");
    }

    const typeMap = {
        'I': 'current',
        'V': 'voltage'
    };

    const unitMap = {
        'I': 'A',
        'V': 'V'
    };

    const pos = match[2]; // Store the extracted component/position

    return {
        type: typeMap[match[1]],
        unit: unitMap[match[1]],
        pos: pos,
        pin: match[3] || 'non', // If no pin is found, set the default value to 'non'
        nod: nodes.includes(pos) // Check if 'pos' exists in the 'nodes' list
    };
}



function getCodeSpiceByProbe(name) {

  var nodes=getNetRefs();
  var probe=parseSignal(name, nodes);
  var netListData = netList();
  

  const foundElement = netListData.find(el => el.ref === probe.pos);
  
  var data;
  if(probe.nod)
    data=name;
  else if((probe.pin=='non') && (probe.type=='voltage') && (foundElement) )
  {
    var a='V('+foundElement.pins[0]+')'; if(a=='V(0)') a='';
    var b='V('+foundElement.pins[1]+')'; if(b=='V(0)') b='';
    if(a=='')
      data=b;
    else if(b=='')
      data=a;
    else
      data=a+'-'+b;
  }
  else if( (probe.type=='voltage') && (foundElement) )
  {
    var foundPinName=false;
    for(var i=0; i<foundElement.pinsName.length; i++)
      if(foundElement.pinsName[i]==probe.pin)
        {
          data='V('+foundElement.pins[i]+')';
          if(data=='V(0)') data='0';
          foundPinName=true;
        }
  }
  else if((probe.pin=='non') && (probe.type=='current') && (foundElement) )
  {
    var newSourceElements ={
                ref: 'Vmesure',
                pins: [foundElement.pins[0],'pnpn'],
                params: ['dc=0']
            }
    
     foundElement.pins[0]='pnpn';
     netListData.push(newSourceElements);
     data='I(Vmesure)';
  }
  else if((probe.type=='current') && (foundElement) )
  {
    var foundPinName=false;
    for(var i=0; i<foundElement.pinsName.length; i++)
      if(foundElement.pinsName[i]==probe.pin){
         var newSourceElements ={
                ref: 'Vmesure',
                pins: [foundElement.pins[i],'pnpn'],
                params: ['dc=0']
            }
            foundElement.pins[i]='pnpn';
            netListData.push(newSourceElements);
            data='I(Vmesure)';
            foundPinName=true;
          }
  }


 var  code = `*\n\n.include "${libarayPath}"\n\n`;;

  netListData.forEach(el => {
    code += `${el.ref}   ${el.pins.join(' ')}   ${el.params.join('  ')}\n`;
  });


  
code+=`.op\n\n.control\nrun\n print ${data}  \n.endc`;

console.log("Generated code: ", code);
return {code:code, data:data, type:probe.type};
}




function getNewStruct(name,nodes,index,netListData,color)
{

  var probe=parseSignal(name, nodes);
  const foundElement = netListData.find(el => el.ref === probe.pos); 
  var newnode='nnn'+index;
  var vmesure='Vmesure'+index;

  var data;

  if(probe.nod)
    data=name;
  else if((probe.pin=='non') && (probe.type=='voltage') && (foundElement) )
  {
    var a='V('+foundElement.pins[0]+')'; if(a=='V(0)') a='';
    var b='V('+foundElement.pins[1]+')'; if(b=='V(0)') b='';

    if(a=='')
      data=b;
    else if(b=='')
      data=a;
    else
      data=a+'-'+b;

    if(data=='-')
      data='0';
    
  }
  else if( (probe.type=='voltage') && (foundElement) )
  {
    var foundPinName=false;
    for(var i=0; i<foundElement.pinsName.length; i++)
      if(foundElement.pinsName[i]==probe.pin)
        {
          data='V('+foundElement.pins[i]+')';
          if(data=='V(0)') data='0';
          foundPinName=true;
        }
  }
  else if((probe.pin=='non') && (probe.type=='current') && (foundElement) )
  {
    var newSourceElements ={
                ref: vmesure,
                pins: [foundElement.pins[0],newnode],
                params: ['dc=0']
            }
    
     foundElement.pins[0]=newnode;
     netListData.push(newSourceElements);
     data='I('+vmesure+')';
  }
  else if((probe.type=='current') && (foundElement) )
  {
    var foundPinName=false;
    for(var i=0; i<foundElement.pinsName.length; i++)
      if(foundElement.pinsName[i]==probe.pin){
         var newSourceElements ={
                ref: vmesure,
                pins: [foundElement.pins[i],newnode],
                params: ['dc=0']
            }
            foundElement.pins[i]=newnode;
            netListData.push(newSourceElements);
            data='I('+vmesure+')';
            foundPinName=true;
          }
  }

  return {name:name, unit:probe.unit, out:data, color:color}
}


  function  getSourceSpiceForAnalysis(){

    var nodes=getNetRefs();
    var netListData = netList();
    var outputs=[];
    
    var elem=drawing.resize.setElement;
    var analy=JSON.parse(elem.getAttribute("description"));

    var r=analy.yAxe.outputs;

    
    for(var i=0; i<r.length; i++){
      var data=getNewStruct(r[i].name,nodes,i,netListData,r[i].color);
      data.pos=r[i].pos;
      outputs.push(data);
    }
    var index=r.length+1;
    var r=analy.xAxe;
    
    if (r.used) {
      const outputName = r.name;
      outputs.push(getNewStruct(r.name,nodes,index,netListData,'none'));
     };


   if(analy.type === "DC Sweep"){
    var r=analy.dcsweep;
    var cmd=`.dc   ${r.param}  ${r.start} ${r.stop} ${r.step}`;
   }
   else {
    var r=analy.time;
    var cmd=`.tran   ${r.step}  ${r.stop}  ${r.start}  uic\n`;
   }

   var code = `*\n\n.include "${libarayPath}"\n\n`;

  netListData.forEach(el => {
    code += `${el.ref}   ${el.pins.join(' ')}   ${el.params.join('  ')}\n`;
    });

    code +=cmd;
   
   var print='';
   for(var i=0; i<outputs.length; i++){
    print+='  '+outputs[i].out;
   }

   
   code+=`\n\n.control\nrun\n print  ${print} > results.txt  \n.endc`;


   return {code:code,outputs:outputs};
  }


   function  getSourceSpiceForOp(){

    var nodes=getNetRefs();
    var netListData = netList();

    var probes = document.getElementsByName('probe');
    var list = [];
    for (var i = 0; i < probes.length; i++){
            list.push({
                name: probes[i].childNodes[2].textContent.split('=')[0],
                elem: probes[i],
                used: false,
            });

        }
  

    var outputs=[];


    for(var i=0; i<list.length; i++){
      console.log(list[i].name);
      var t=getNewStruct(list[i].name,nodes,i,netListData,'0');
      t.elem=list[i].elem;
      list[i].used=t.out!='0';
      if(t.out!='0')
        outputs.push(t);
    }



   var cmd=`.op\n`;
  
   var code = `*\n\n.include "${libarayPath}"\n\n`;

  netListData.forEach(el => {
    code += `${el.ref}   ${el.pins.join(' ')}   ${el.params.join('  ')}\n`;
    });

    code +=cmd;
   
   var print='';
   for(var i=0; i<outputs.length; i++){
    print+='  '+outputs[i].out;
   }

   
   code+=`\n\n.control\nrun\n print  ${print}  \n.endc`;
   console.log(code);


   return {code:code,outputs:outputs,list:list};
  }


  function getNetlistSpice(){

    var netListData = netList();
    var code = `*\n\n.include "${libarayPath}"\n\n`;
    
    netListData.forEach(el => {
    code += `${el.ref}   ${el.pins.join(' ')}   ${el.params.join('  ')}\n`;
    });
    
    return  code;
  }