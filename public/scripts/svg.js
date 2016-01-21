// 4seg 1mm
var x1=330/2;
var y1=330/2;
var SVG = $('#mySVG');
SVG.height(330);
SVG.width(330);
var cx = 330/2;
var cy = 330/2;
ejeX();
ejeY();

function addLineSVG(x,y,color) { 
  var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
    $(line)
    .attr("stroke",color)
    .attr("stroke-width","1")
    .attr("x1",x1)
    .attr("y1",y1)
    .attr("x2",x)
    .attr("y2",y);
  SVG.append(line);
  x1=x;
  y1=y;
}

io.on('canvas', function (data) {  
  if(data.z<=0){
    addLineSVG(cx+data.x,cy+data.y,"black");
  }else{
    addLineSVG(cx+data.x,cy+data.y,"red");
  }
  if(data.end){
    //SVG.removeClass('loading');
    
  }
  if(data.cleaner){
    $("#mySVG line+").remove();
    ejeX();
    ejeY();
  }
});

function ejeX() {
  var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
    $(line)
    .attr("stroke","rgb(0,0,255)")
    .attr("stroke-width","1")
    .attr("x1",0)
    .attr("y1",330/2)
    .attr("x2",330)
    .attr("y2",330/2);
  SVG.append(line);
}

function ejeY() { 
  var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
    $(line)
    .attr("stroke","rgb(0,0,255)")
    .attr("stroke-width","1")
    .attr("x1",330/2)
    .attr("y1",0)
    .attr("x2",330/2)
    .attr("y2",330);
  SVG.append(line);
}