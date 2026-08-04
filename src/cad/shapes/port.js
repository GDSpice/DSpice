
function portRotate(element) {

        if(element.getAttribute("directory")!='standard')
            return;

        if(element.firstChild.getAttribute("symbolname")!="Port")
            return;

        var pin = element.querySelector('[name="pin"]');
        var bbox = pin.childNodes[2].getBBox();
        var polygon = element.querySelector('[name="polygon"]');

        var dir=element.firstChild.getAttribute("direction");

        var pi = getArrayPoints(pin);
        var pl = getArrayPoints(polygon);

        bbox.width=1.5*bbox.width;

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

         var width=bbox.width+20;
         var height=20;

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

         var width=bbox.width+20;
         var height=20;
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

           var height=bbox.width+20;
           var width=20;

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

            var height=bbox.width+20;
            var width=20;

            if(dir=='Input'){
            pl[3].y =pl[2].y ;
           } else if(dir=='Output'){
            pl[1].y =pl[0].y ;
            pl[5].y =pl[0].y ;
           }
        }
        
        polygon.setAttribute("points", polylineToAttribute(pl, 0, 0));
        element.setAttribute("width", parseInt(width/5)*5);
        element.setAttribute("height", parseInt(height/5)*5);
        information(drawing.resize);
    
}