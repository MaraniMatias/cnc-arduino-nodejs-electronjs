var x1=330/2;
var y1=330/2;
var SVG = $('#mySVG');
SVG.height(330);
SVG.width(330);
var cx = 330/2;
var cy = 330/2;

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
  x1=x;y1=y;
}

io.on('canvas', function (data) {  
  if(data.z<=0){
    addLineSVG(cx+data.x,cx+data.y,"black");
  }else{
    addLineSVG(cx+data.x,cx+data.y,"red");
  }
  if(data.end){
    //SVG.removeClass('loading');
  }
  if(data.cleaner){
  
  }
});