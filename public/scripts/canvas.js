var c = document.getElementById("myCanvas");
c.width  = 600;
c.height = 600;
var ctx = c.getContext("2d");
ctx.width  = c.width;
ctx.height = c.height;
var cx = ctx.width/2;
var cy = ctx.height/2;
ctx.strokeStyle = 'black';
ctx.lineWidth = 1;
    
io.emit('connection');
io.on('canvas', function (data) {  
  if(data.z<=0){
    ctx.lineTo(cx+data.x*3,cy+data.y*3);
  }else{
    ctx.moveTo(cx+data.x*3,cy+data.y*3);
  }
  if(data.end){
    ctx.stroke();
    ctx.save();
  }
  if(data.cleaner){
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.moveTo(cx,0);
    ctx.lineTo(cx,ctx.height);
    ctx.stroke();
    ctx.moveTo(0,cy);
    ctx.lineTo(ctx.width,cy);
    ctx.stroke();
    ctx.save();
    ctx.moveTo(cx,cy);
  }
});
