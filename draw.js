var canvas = document.getElementById("network_creator");
canvas.addEventListener("mousedown", doMouseDown, false);
var ctx = canvas.getContext("2d");

canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.getBoundingClientRect().height
var width = canvas.width;
var height = canvas.height;

var mouseX = 0;
var mouseY = 0;

var last_frame = Date.now()
var this_frame = Date.now()

function init() {
    last_frame = Date.now()
    this_frame = Date.now()
    window.requestAnimationFrame(draw);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function init() {
    window.requestAnimationFrame(draw);
}

var seconds = 0;

function draw() {
    canvas.width = canvas.getBoundingClientRect().width
    canvas.height = canvas.getBoundingClientRect().height
    width = canvas.width;
    height = canvas.height;

    last_frame = this_frame
    this_frame = Date.now()
    var sec = (this_frame - last_frame) / 1000.0
    seconds += sec;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000"
    ctx.fillRect(10 + 10*seconds, 10, 10, 10)

    width = 100

    // Basic Bezier
    ctx.beginPath()
    ctx.moveTo(20, 20)
    ctx.bezierCurveTo(width, 20, width, 60, 20, 60)
    // ctx.bezierCurveTo(20, 120, 20, 120, 20, 120)
    // ctx.bezierCurveTo(20, 20, 20, 20, 20, 20)
    ctx.fill()
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(20, 20)
    ctx.bezierCurveTo(width, 20, width, 60, 20, 60)
    // ctx.bezierCurveTo(20, 120, 20, 120, 20, 120)
    // ctx.bezierCurveTo(20, 20, 20, 20, 20, 20)

    ctx.stroke();
    ctx.fill();

    window.requestAnimationFrame(draw);
}



function doMouseDown(e){

    if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
}

init();