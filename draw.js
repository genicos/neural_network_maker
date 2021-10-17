var canvas = document.getElementById("network_creator");
canvas.addEventListener("mousedown", doMouseDown, false);
var ctx = canvas.getContext("2d");

canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.getBoundingClientRect().height
var width = canvas.width;
var height = canvas.height;

var nodeRadius = 10
var defaultFunctionLength = 50

var mouseX = 0;
var mouseY = 0;

var last_frame = Date.now()
var this_frame = Date.now()

var networkTest = new Network()
networkTest.add_node(1)
networkTest.nodes[0].x = 100
networkTest.nodes[0].y = 100

console.log(networkTest.nodes[0].x)

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

function drawNode(x, y) {
    ctx.fillStyle = "white"
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'

    ctx.beginPath()
    ctx.rect(x - nodeRadius, y - nodeRadius, 2 * nodeRadius, 2 * nodeRadius)
    ctx.fill()
    ctx.stroke()
}

// here we draw the function naively without checking for tensor positions. That must be handled 
// by movement logic
function drawFullFunction(network, nodeIndex) {
    if (nodeIndex >= network.nodes.length) {
        console.log("Invalid node index!")
    }

    var n = network.nodes[nodeIndex]

    ctx.fillStyle = "blue"
    ctx.beginPath()
    ctx.moveTo(n.x - nodeRadius, n.y - nodeRadius)
    ctx.lineTo(n.x - nodeRadius, n.y + nodeRadius)
    // check if parents are null, otherwise draw to parent1's right side
    if (n.parent_1 == null) {
        ctx.lineTo(n.x - defaultFunctionLength, n.y + nodeRadius)
        ctx.lineTo(n.x - defaultFunctionLength, n.y - nodeRadius)
    }
    else {
        ctx.lineTo(n.parent_1.x + nodeRadius, n.parent_1.y + nodeRadius)
        ctx.lineTo(n.parent_1.x + nodeRadius, n.parent_1.y - nodeRadius)
    }

    if (n.parent_2 == null) {
        ctx.lineTo(n.x - defaultFunctionLength / 2 - nodeRadius, n.y + nodeRadius)
        ctx.lineTo(n.x - defaultFunctionLength / 2 + nodeRadius, n.y + nodeRadius)
    }
    else {
        ctx.lineTo(n.parent_2.x - nodeRadius, n.parent_2.y + nodeRadius)
        ctx.lineTo(n.parent_2.x + nodeRadius, n.parent_2.y + nodeRadius)
    }

    ctx.closePath()
    ctx.fill()
}

function draw() {
    canvas.width = canvas.getBoundingClientRect().width
    canvas.height = canvas.getBoundingClientRect().height
    width = canvas.width
    height = canvas.height


    // Stroke on top of fill
    ctx.beginPath();
    ctx.rect(25, 25, 100, 100);
    ctx.fill();
    ctx.stroke();

    // Fill on top of stroke
    ctx.beginPath();
    ctx.rect(175, 25, 100, 100);
    ctx.stroke();
    ctx.fill();

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

    drawNode(networkTest.nodes[0].x, networkTest.nodes[0].y)
    drawFullFunction(networkTest, 0)

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