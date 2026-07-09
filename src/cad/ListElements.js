
	treeData = [
       {
         name: 'All Object',
         collapsed: true, 
         nodes: [],
		 elem: []
       }
    ];
function getListElementsAddToPageDescription()
{
	var svg = document.getElementById("sym");
	var selecElem=drawing.resize.setElement;
	
	var collection = svg.children;
	treeData[0].nodes=[];
	treeData[0].elem=[];
	var select='';

	for(var i=1; i< collection.length;i++)
	{
	   var elem = collection[i];
	   var name='Pos '+i+': ';
	   if(elem.getAttribute("name")=='pin'){
		   name+='pin ['+elem.childNodes[2].textContent+']';
	   } else if(elem.getAttribute("name")=='part'){
		   name+='part ['+elem.getAttribute("sref")+']';
	   } else if(elem.getAttribute("name")=='ref'){
		   name+='ref ['+elem.textContent+']';
	   } else if(elem.getAttribute("name")=='param'){
		   name+='param ['+elem.textContent+']';
	   } else if(elem.getAttribute("name")=='net'){
		   name+='net ['+elem.getAttribute("ref")+']';
	   } else {
		   name+=elem.getAttribute("name");
	   }

	    treeData[0].nodes.push(name);
		treeData[0].elem.push(elem);
		if(elem==drawing.resize.setElement)
			select=name;

	}
	
	init(treeData,select);
}

function selectElemByIndex(select){
	var list=treeData[0].nodes;
	for(var i=0; i< list.length; i++){
		if(list[i]==select){
			drawing.resize.deletEllipse();
			drawing.resize.setElement=treeData[0].elem[i];
			drawing.resize.creatEllipse();
			drawing.objectInspector.getSelect(treeData[0].elem[i]);
			break;
		}
	}

}


function updateListElements()
{
	getListElementsAddToPageDescription();
}
