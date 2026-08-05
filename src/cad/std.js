/*
#-------------------------------------------------------------------------------
# Name:        std.js
# Author:      d.fathi
# Created:     05/07/2021
# Copyright:   (c) DSpice 2026
# Licence:    free
#-------------------------------------------------------------------------------
 */

function addGnd() {
 drawing.dir='standard';
 drawing.libLocale=true;
 drawing.symbolfile='GND';
 drawing.shapes.part='<g width="150" top="572" left="0" height="150" zoom="20" reference="0" std="true" description=" " modelname="GND" setref="GND" symbolname="GND"></g><polyline points="24,57 36,57 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><polyline points="28,59 32,59 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline><g points="30,50 30,55 " class="polyline" name="pin" type="simple"><polyline points="30,50 30,55 " style="stroke: rgb(255, 0, 0); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="27" y="47" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="28" y="57" transform="rotate(90 28 57)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;">p</text><text r="0" x="30" y="50" transform="rotate(0 30 50)" style="font-size: 12px; font-family: &quot;Times New Roman&quot;; display: none;"> </text><ellipse cx="30" cy="51.5" rx="3.5" ry="3.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="26.5,55 33.5,55 30,58.5 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g><polyline points="22,55 38,55 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline>';
 drawing.add('part');
 addShape('part');
}

function addPort(){
    var port_description='<g width="0" top="0" left="0" height="0" zoom="8.000000000000002" std="true" description=" " reference="Port" maxsize="30" direction="Bi-Direct" modelname="Port" setref="Port" symbolname="Port"></g>';
    var port_pin='<g points="0,5 8,5 " class="polyline" name="pin" type="simple"><polyline points="40,50 40,50 " style="stroke: rgb(255, 255, 127); stroke-width: 1px;"></polyline><rect width="6" height="6" class="pin" x="37" y="47" style="stroke: rgb(0, 255, 0); fill: none; stroke-width: 1px;"></rect><text r="0" x="42" y="52" transform="rotate(0 42 52)" style="font-size: 7px; font-family: Arial; fill: rgb(0, 0, 0);">port</text><text r="0" x="40" y="50" transform="rotate(0 40 50)" style="font-size: 7px; font-family: Arial; display: none; fill: rgb(0, 0, 0);"> </text><ellipse cx="38.5" cy="50" rx="1.5" ry="1.5" style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></ellipse><polygon points="40,48.5 40,51.5 41.5,50 " style="stroke: rgb(255, 0, 0); fill: rgb(255, 0, 0); stroke-width: 1px; display: none;"></polygon></g>';
    var port_polygon='<polygon points="30,0 34,5 30,10 6,10 1,5 6,0" class="draggable" name="polygon" style="stroke: rgb(0, 0, 255); fill: rgb(255, 255, 127); stroke-width: 1px;filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));"></polygon>';
    var port_polyline='<polyline points="0,5 1,5 " class="polyline" name="polyline" style="stroke: rgb(0, 0, 255); fill: none; stroke-width: 1px;"></polyline>';  
    drawing.dir='standard';
    drawing.libLocale=true;
    drawing.symbolfile='PORT';
    drawing.shapes.part=port_description+port_polygon+port_pin+port_polyline;
    drawing.add('part');
    addShape('part');
}



function addPart(part,dir,libLocale,symbolfile)
{
 drawing.shapes.part=part;
 drawing.dir=dir;
 drawing.libLocale=libLocale;
 drawing.symbolfile=symbolfile;
 drawing.add('part');
 addShape('part');
}



function endDrawing()
{
	if(drawing.shapes.design.start)
	 drawing.saveData('Add :'+drawing.shapes.design.name);
	 drawing.shapes.design = {
        mouse: false,
        start: false,
        name: '',
        end: false
    }
}
