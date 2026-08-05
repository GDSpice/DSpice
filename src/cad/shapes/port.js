
function portRotate(element) {

        if(element.getAttribute("directory")!='standard')
            return;

        if(element.firstChild.getAttribute("symbolname")!="Port")
            return;

        var pin = element.querySelector('[name="pin"]');
        var bbox = pin.childNodes[2].getBBox();
        var polygon = element.querySelector('[name="polygon"]');
        var polyline = element.querySelector('[name="polyline"]');

        var dir=element.firstChild.getAttribute("direction");

        var pi = getArrayPoints(pin);
        var pl = getArrayPoints(polygon);
        var pline = getArrayPoints(polyline);

        drawingPin(pin);

        bbox.width=bbox.width+10;

        if(pi[0].x > pi[1].x) {
         
            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5-bbox.width;
            pl[3].x = pi[0].x-10-bbox.width;
            pl[4].x = pi[0].x-5-bbox.width;
            pl[5].x = pi[0].x-5;

            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5;
            pl[3].y = pi[0].y;
            pl[4].y = pi[0].y+5;
            pl[5].y = pi[0].y+5;



           if(dir=='Input'){
            pl[3].x =pl[2].x ;
           } else if(dir=='Output'){
            pl[1].x =pl[0].x ;
            pl[5].x =pl[0].x ;
           }



        } else if(pi[0].x < pi[1].x) {          
            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x+5;
            pl[2].x = pi[0].x+5+bbox.width;
            pl[3].x = pi[0].x+10+bbox.width;
            pl[4].x = pi[0].x+5+bbox.width;
            pl[5].x = pi[0].x+5;

            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5;
            pl[3].y = pi[0].y;
            pl[4].y = pi[0].y+5;
            pl[5].y = pi[0].y+5;


            if(dir=='Input'){
            pl[3].x =pl[2].x ;
           } else if(dir=='Output'){
            pl[1].x =pl[0].x ;
            pl[5].x =pl[0].x ;
           }

        } else if(pi[0].y > pi[1].y) {
         
            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y-5;
            pl[2].y = pi[0].y-5-bbox.width;
            pl[3].y = pi[0].y-10-bbox.width;
            pl[4].y = pi[0].y-5-bbox.width;
            pl[5].y = pi[0].y-5;

            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5;
            pl[3].x = pi[0].x;
            pl[4].x = pi[0].x+5;
            pl[5].x = pi[0].x+5;


            if(dir=='Input'){
            pl[3].y =pl[2].y ;
           } else if(dir=='Output'){
            pl[1].y =pl[0].y ;
            pl[5].y =pl[0].y ;
           }


        } else if(pi[0].y < pi[1].y) {          
            pl[0].y = pi[0].y;
            pl[1].y = pi[0].y+5;
            pl[2].y = pi[0].y+5+bbox.width;
            pl[3].y = pi[0].y+10+bbox.width;
            pl[4].y = pi[0].y+5+bbox.width;
            pl[5].y = pi[0].y+5;

            pl[0].x = pi[0].x;
            pl[1].x = pi[0].x-5;
            pl[2].x = pi[0].x-5;
            pl[3].x = pi[0].x;
            pl[4].x = pi[0].x+5;
            pl[5].x = pi[0].x+5;


            if(dir=='Input'){
            pl[3].y =pl[2].y ;
           } else if(dir=='Output'){
            pl[1].y =pl[0].y ;
            pl[5].y =pl[0].y ;
           }
        }


        var xmin=pl[0].x;
        var ymin=pl[0].y;

        var xmax=pl[0].x;
        var ymax=pl[0].y;

        for(var i=0; i<pl.length; i++){
          if(pl[i].x <xmin) xmin=pl[i].x;
          if(pl[i].y <ymin) ymin=pl[i].y;

          if(pl[i].x >xmax) xmax=pl[i].x;
          if(pl[i].y >ymax) ymax=pl[i].y;
        }

        xmin=parseInt(xmin/5)*5;
        ymin=parseInt(ymin/5)*5;
        xmax=parseInt(xmax/5)*5;
        ymax=parseInt(ymax/5)*5;

        for(var i=0; i<pl.length; i++){
          pl[i].x -= xmin;
          pl[i].y -= ymin;
        }

        for(var i=0; i<pi.length; i++){
          pi[i].x -= xmin;
          pi[i].y -= ymin;
        }

        for(var i=0; i<pline.length; i++){
          pline[i].x -= xmin;
          pline[i].y -= ymin;
        }

        pin.setAttribute("points", polylineToAttribute(pi, 0, 0));
        drawingPin(pin);

        polyline.setAttribute("points", polylineToAttribute(pline, 0, 0));
        polygon.setAttribute("points", polylineToAttribute(pl, 0, 0));

        width=xmax-xmin;
        height=ymax-ymin;
        element.setAttribute("width", parseInt(width/5)*5);
        element.setAttribute("height", parseInt(height/5)*5);

      
  
        information(drawing.resize);
    
}