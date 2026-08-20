/*
#-------------------------------------------------------------------------------
# Name:        plots.js
# Purpose:     DSpice
# Author:      d.fathi
# Created:     06/11/2021
# Copyright:  (c) DSpice 2021-2026
# Licence:
#-------------------------------------------------------------------------------
 */
/*
Despite the fact that Plotly.js is open source, it is licensed under the MIT license, which means that you can use it for free in your own projects, 
even commercial ones. However, if you want to use Plotly.js in a commercial product, you may need to purchase a commercial license from Plotly.
it used in this project for plotting graphs and visualizing data. It provides a wide range of chart types and customization options, making it a popular
 choice for data visualization in web applications.

*/


function plots() {
    var npoints = 10000;
    var y = [];
    for (var i = 0, l = npoints; i < l; i++) {
        y.push(Math.random())
    };

    var x = [];
    for (var i = 0, l = npoints; i < l; i++) {
        x.push(i);
    };

    var listForPlot = document.getElementsByName('plots');
    for (var i = 0; i < listForPlot.length; i++) {
        Plotly.plot(listForPlot[i], [{
                    type: 'scatter',
                    x: x,
                    y: y
                }
            ], {
            margin: {
                l: 5,
                r: 5,
                b: 5,
                t: 5,
                pad: 4
            },
            paper_bgcolor: '#7f7f7f',
            plot_bgcolor: '#c7c7c7'
        });
        Plotly.redraw(listForPlot[i]);
    }

}
/*

var plotConfig = {
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'pan2d', 'toggleSpikelines', 'select2d', 'lasso2d', 'resetScale2d']
};
*/

// ============================================
// Custom button icon for opening in a new window
// ============================================
var openExternalIcon = {
    width: 1000,
    height: 1000,
    path: 'M786 296v-267q0-15-11-26t-25-10h-214v214h-143v-214h-214q-15 0-25 10t-11 26v267q0 1 0 2t0 2l321 264 321-264q1-1 1-4z m124 39l-34-41q-5-5-12-6h-2q-7 0-12 3l-386 322-386-322q-7-4-13-4-7 2-12 7l-35 41q-4 5-3 13t6 12l401 334q18 15 42 15t43-15l136-114v109q0 8 5 13t13 5h107q8 0 13-5t5-13v-227l122-102q5-5 6-12t-4-13z',
    transform: 'matrix(1 0 0 -1 0 850)'
};

// ============================================
// Plotly configuration for the plots
// ============================================
var plotConfig = {
    displaylogo: false,
    modeBarButtonsToAdd: [
        {
            name: 'openExternal',
            title : 'Open in New Window',
            icon: openExternalIcon,
            click: function(gd) {
                // Get the data and layout from the current plot
                var data = gd.data;
                var layout = gd.layout;
                
                // Check if the Electron API is available
                if (window.electron && window.electron.openGraphWindow) {
                    window.electron.openGraphWindow({
                        data: data,
                        layout: layout,
                        title: layout.title ? layout.title.text : 'Analysis Graph'
                    });
                } else {
                    // Fallback for non-Electron environments: open in a new browser window
                    var graphData = JSON.stringify({data: data, layout: layout});
                    var newWindow = window.open('', '_blank');
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Graph - Full View</title>
                            <script src="https://cdn.plot.ly/plotly-latest.min.js"><\/script>
                            <style>
                                body { margin: 0; padding: 0; overflow: hidden; background: #fff; }
                                #graph { width: 100vw; height: 100vh; }
                            </style>
                        </head>
                        <body>
                            <div id="graph"></div>
                            <script>
                                var graphData = ${graphData};
                                Plotly.newPlot('graph', graphData.data, graphData.layout, {
                                    displayModeBar: true,
                                    displaylogo: false
                                });
                            <\/script>
                        </body>
                        </html>
                    `);
                }
            }
        }
    ],
    modeBarButtonsToRemove: ['sendDataToCloud', 'resetScale2d'] // Remove the default "Send to Cloud" button
};

function addPlot(elem) {
	creatPin(elem);
	creatPin(elem);
	elem.childNodes[1].childNodes[0].style.stroke = "#0000ff";

    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
   // newElement.setAttribute("class", "draggable");
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 220);
    newElement.setAttribute("height", 180);
    newElement.innerHTML = "<div name='plots' style='border-style: double;' ondblclick='showPlotInModel(this)'></div>";
    elem.appendChild(newElement);
}

function newPlots(element) {
  var layout = {
      margin: {
          l: 35,
          r: 25,
          b: 35,
          t: 35
      },
  xaxis: {
          title:{text:''},
          showgrid:true,
          gridcolor:"#000000",
          autorange: true
      },
  yaxis: {
          gridcolor:"#000000",
          showgrid:true,
          autorange: true
      },
  title:' ',
  font: {
          size: 12,
          family: 'sans-serif',
          color:'#000000'
      },
  legend:{
    font:
    {family: 'sans-serif',
    size: 9,
    color: '#000000'},
    bgcolor: '#E2E2E2',
    bordercolor: '#FFFFFF',
    borderwidth: 1},
    showlegend: true,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    bordercolor: '#000000',

    grid: {
    rows: 1,
    columns: 1,
    pattern: 'independent',
    roworder: 'bottom to top'
  }
  };


    var e = element.lastChild.firstChild;
    Plotly.plot(e, [{
                type: 'scatter',
                x: [],
                y: []
            }
        ], layout, plotConfig);

}

function modifedSizeDivByoscilloscope(element) {

    if (element.getAttribute("name") == "oscilloscope") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"));
        var h = parseInt(element.getAttribute("height"));
        element.setAttribute('transform', "translate(" + x + "," + y + ")");
        element.lastChild.setAttribute("width", w);
        element.lastChild.setAttribute("height", h);

        var e = element.lastChild.firstChild;
        var gd = e;
        //Plotly.redraw(e);

        e.style.width = w - 6;
        e.style.height = h - 6;

        update = {
            width: w - 8,
            height: h - 8
        };
        Plotly.relayout(e, update);
		plotGetPos(element);
    }


}



function plotsSaveDataLayoutInDiv() {
    var listForPlot = document.getElementsByName('plots');
    for (var i = 0; i < listForPlot.length; i++) {
        var gd = listForPlot[i];
        layout = JSON.stringify(gd.layout);
        data = JSON.stringify(gd.data);
        //alert(data);
        listForPlot[i].setAttribute("layout", layout);
        listForPlot[i].setAttribute("data", data);
    }
}

function plotGetPos(oscill) {



		var rot=parseInt(oscill.getAttribute("rot"));
        var height=parseInt(oscill.getAttribute("height"));
		var width=parseInt(oscill.getAttribute("width"));
		//------------------------Channel A--------------------------------
		var elem = oscill.childNodes[0];
		var h=parseInt(height*0.5/20)*5;
		var w=parseInt(width*0.5/20)*5;
		posPin(elem,w,h,width,height,rot);
        //------------------------Channel B--------------------------------
        var elem = oscill.childNodes[1];
		var h=parseInt(height*3.5/20)*5;
		var w=parseInt(width*3.5/20)*5;
		posPin(elem,w,h,width,height,rot);
        //----------------------------------------------------------------------------


}
function oscillRotation(type)
{
  var rot=parseInt(drawing.resize.setElement.getAttribute("rot"));
  rot=rot+1;
  if(rot>3)
	  rot=0;
  drawing.resize.setElement.setAttribute("rot",rot);
  plotGetPos(drawing.resize.setElement);

}

function plotsOpenDataLayoutInDiv() {
   var listForPlot = document.getElementsByName('plots');
    for (var i = 0; i < listForPlot.length; i++) {

        layout = JSON.parse(listForPlot[i].getAttribute("layout"));
        data = JSON.parse(listForPlot[i].getAttribute("data"));
        Plotly.plot(listForPlot[i], data, layout, plotConfig);
    }
}

function showPlotInModel(self) {
    /*
    modal.style.display = "block";
    layout = self.layout;
    data = self.data;
    Plotly.newPlot("model-body", data, layout);

    div = document.getElementById("model-body");

    w = div.offsetWidth;
    h = document.body.clientHeight - 200;

    update = {
    width: w - 60,
    height: h - 60
    };
    Plotly.relayout("model-body", update);
     */
}

//---------------------------Start  Simulation------------------------------------------

var plotslist = [];
var time = [];
var listSignals = [];

function getPlots(typeanalysis) {
    listSignals = [];
    time = [];
    plotslist = [];

    var oscilloscope = document.getElementsByName('oscilloscope');
    for (var i = 0; i < oscilloscope.length; i++) {
		d=netListPins(oscilloscope[i]);
        plotslist.push({
            cha: d[0],
            chb: d[1],
			fx:  oscilloscope[i].getAttribute("fx"),
            elem: oscilloscope[i],
            valueA: [],
            valueB: [],
        });
    }

    for (var i = 0; i < plotslist.length; i++) {
        if (plotslist[i].cha != '0')
            listSignals.push(plotslist[i].cha);
        if (plotslist[i].chb != '0')
            listSignals.push(plotslist[i].chb);

    }
var d=[];
for(var i=0; i<listSignals.length; i++)
	d.push('"'+listSignals[i]+'"');
    return d;
}
var plotStart,interactiveStart;

function plotStartInter(units) {

ux=units[units.length-1];

   for (var i = 0; i < plotslist.length; i++) {
        var data = [];
      var layout = {
        margin: {
            l: 35,
            r: 25,
            b: 35,
            t: 35
        },
        xaxis: {
            title: {
                text: xNameAnalysis+'['+ux+']',

                font: {
                    size: 9,
					color:'#000000'
                }
            },
        },
		yaxis: {
            title: {
                text: '',
                font: {
                    size: 9,
					color:'#000000'
                }
            },
        },
        title: plotslist[i].elem.getAttribute("title"),
        font: {
            size: 9
        }
    };



		labx=0;
        labt='';
		labc='#00000';

        var e = plotslist[i].elem.lastChild.firstChild;
        var ra = plotslist[i].cha;
		var rb = plotslist[i].chb;

        if ((ra!='0')&&(plotslist[i].fx=='A|B')) {
            var u = '';
            n = listSignals.indexOf(plotslist[i].cha);
            if (n != -1)
                u = '[' + units[n] + ']';
            data.push({
                type: 'scatter',
                name: plotslist[i].cha + u,
                line: {
                    color: plotslist[i].elem.childNodes[0].childNodes[0].style.stroke
                },
                y: plotslist[i].valueA,
                x: time
            });

			labx=labx+1;
			labt=plotslist[i].cha+u;
			labc=plotslist[i].elem.childNodes[0].childNodes[0].style.stroke;
        }

        if ((rb!='0')&&(plotslist[i].fx=='A|B')) {
            var u = '';
            n = listSignals.indexOf(plotslist[i].chb);
            if (n != -1)
                u = '[' + units[n] + ']';
            data.push({
                type: 'scatter',
                name: plotslist[i].chb + u,
                line: {
                    color: plotslist[i].elem.childNodes[1].childNodes[0].style.stroke
                },
                y: plotslist[i].valueB,
                x: time
            });

			labx=labx+1;
			labt=plotslist[i].chb+u;
			labc=plotslist[i].elem.childNodes[1].childNodes[0].style.stroke;
        }

		if ((ra!= '0')&&(rb!='0')&&(plotslist[i].fx=='A(B)')) {
			var u = '';
            n = listSignals.indexOf(plotslist[i].cha);

            if (n != -1)
                u = '[' + units[n] + ']';
            data.push({
                type: 'scatter',
                name: plotslist[i].cha + u,
                line: {
                    color: plotslist[i].elem.childNodes[0].childNodes[0].style.stroke
                },
                y: plotslist[i].valueA,
                x: plotslist[i].valueB
            });

			var u = '';
            n = listSignals.indexOf(plotslist[i].chb);
            if (n != -1)
                u = '[' + units[n] + ']';

			layout.xaxis.title.text=plotslist[i].chb + u;
			layout.xaxis.title.font.color=plotslist[i].elem.childNodes[1].childNodes[0].style.stroke;

			labx=labx+1;
			labt=plotslist[i].cha+u;
			labc=plotslist[i].elem.childNodes[0].childNodes[0].style.stroke;

		}

	  	if ((ra!='0')&&(rb!='0')&&(plotslist[i].fx=='B(A)')) {
			var u = '';

            n = listSignals.indexOf(plotslist[i].cha);
            if (n != -1)
                u = '[' + units[n] + ']';
            data.push({
                type: 'scatter',
                name: plotslist[i].cha + u,
                line: {
                    color: plotslist[i].elem.childNodes[1].childNodes[0].style.stroke
                },
                y: plotslist[i].valueB,
                x: plotslist[i].valueA
            });

			var u = '';
            n = listSignals.indexOf(plotslist[i].cha);
            if (n != -1)
                u = '[' + units[n] + ']';

			layout.xaxis.title.text=plotslist[i].cha + u;
			layout.xaxis.title.font.color=plotslist[i].elem.childNodes[0].childNodes[0].style.stroke;

			labx=labx+1;
			labt=plotslist[i].chb+u;
			labc=plotslist[i].elem.childNodes[1].childNodes[0].style.stroke;

		}

		if(labx==1)
		{
		    layout.yaxis.title.text=labt;
			layout.yaxis.title.font.color=labc;
		}
	    else
			layout.yaxis.title.text='';


        Plotly.newPlot(e, data, layout, plotConfig);
    }

    if ((listSignals.length == 0)&&(listElemWithEvent==0))
        return;
    window.foo.itRun(true);
    plotStart = setInterval(function () {
		interactiveStart=true;
        var listCommand = [];
        window.foo.return_list(listCommand, function (pyval) {
            //window.foo.jscallme("Un message a été reçu: " + pyval);
            plotAddValue(pyval);
        });
    }, 40);
}

function plotStopFunction() {

    clearInterval(plotStart);
	interactiveStart=false;
    window.foo.itRun(false);
}

function plotAddValue(pyval) {
    var n = pyval.length - 2;
    time.push(pyval[n]);
	if(pyval[n+1])
	{
		plotStopFunction();
		return
}
for (var i = 0; i < plotslist.length; i++)
    for (var j = 0; j < listSignals.length; j++)
            if (plotslist[i].cha == listSignals[j]) {
                plotslist[i].valueA.push(pyval[j]);
				break;
            }
for (var i = 0; i < plotslist.length; i++)
    for (var j = 0; j < listSignals.length; j++)
            if (plotslist[i].chb == listSignals[j])
			{
		        plotslist[i].valueB.push(pyval[j]);
				break;
			}

    for (var i = 0; i < plotslist.length; i++)
        Plotly.redraw(plotslist[i].elem.lastChild.firstChild);

}
