var canvas = document.getElementById("network_creator")
canvas.addEventListener("mousedown", doMouseDown, false)
canvas.addEventListener("mousemove", doMouseMove, false)
canvas.addEventListener("mouseup", doMouseUp, false)
canvas.addEventListener("dblclick", doDoubleClick, false)
var ctx = canvas.getContext("2d");

canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.getBoundingClientRect().height
var width = canvas.width;
var height = canvas.height;

var tensorRadius = 10
var defaultFunctionLength = 50

var down = false
var draggedIndex = -1

var mouseX = 0;
var mouseY = 0;

var last_frame = Date.now()
var this_frame = Date.now()

var networks = []
var networkIndex = 0

networks.push(new Network())
networks[0].add_tensor(new Tensor())
networks[0].tensors[0].x = 200
networks[0].tensors[0].y = 200

networks[0].add_tensor(new Tensor())
networks[0].tensors[1].x = 100
networks[0].tensors[1].y = 200

networks[0].add_tensor(new Tensor())
networks[0].tensors[2].x = 150
networks[0].tensors[2].y = 150
networks[0].tensors[2].live = true

networks[0].add_operator(new Operator())
networks[0].operators[0].inputs = [1, 2]
networks[0].operators[0].outputs = [0]
networks[0].operators[0].func = 5

networks[0].add_tensor(new Tensor())
networks[0].tensors[3].x = 400
networks[0].tensors[3].y = 200

networks[0].add_tensor(new Tensor())
networks[0].tensors[4].x = 300
networks[0].tensors[4].y = 200

networks[0].add_tensor(new Tensor())
networks[0].tensors[5].x = 350
networks[0].tensors[5].y = 150
networks[0].tensors[5].live = true

networks[0].add_operator(new Operator())
networks[0].operators[1].inputs = [4, 5]
networks[0].operators[1].outputs = [3]
networks[0].operators[1].func = 5

console.log(networks[0].tensors[0].x)

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

function drawTensor(network, tensorIndex) {
    let t = network.tensors[tensorIndex]

    if (t.live) {
        ctx.fillStyle = "white"
        ctx.lineWidth = 1
        ctx.setLineDash([])
        ctx.strokeStyle = 'black'
    }
    else {
        ctx.fillStyle = "rgba(255,255,255,0)"
        ctx.lineWidth = 1
        ctx.setLineDash([3,4])
        ctx.strokeStyle = 'Grey'
    }

    ctx.beginPath()
    ctx.rect(t.x - tensorRadius, t.y - tensorRadius, 2 * tensorRadius, 2 * tensorRadius)
    ctx.fill()
    ctx.stroke()
}

// here we draw the function naively without checking for tensor positions. That must be handled 
// by movement logic

function drawOperator(network, operatorIndex) {
    let o = network.operators[operatorIndex]

    switch (o.func) {
        case 0: // abstraction
            break
        case 1: // identity
            break
        case 2: // add
            break
        case 3: // subtract
            break
        case 4: // scale
            break
        case 5: // full
            let input1 = network.tensors[o.inputs[0]]
            let input2 = network.tensors[o.inputs[1]]
            let output = network.tensors[o.outputs[0]]

            var functionGradient = ctx.createLinearGradient(output.x, output.y, output.x, output.y - defaultFunctionLength / 2)
            functionGradient.addColorStop(0, "#4D8DB2")
            functionGradient.addColorStop(1, "#4D5BB2")

            ctx.fillStyle = functionGradient
            ctx.beginPath()
            ctx.moveTo(output.x - tensorRadius, output.y - tensorRadius)
            ctx.lineTo(output.x - tensorRadius, output.y + tensorRadius)

            ctx.lineTo(input1.x + tensorRadius, input1.y + tensorRadius)
            ctx.lineTo(input1.x + tensorRadius, input1.y - tensorRadius)

            ctx.lineTo(input2.x - tensorRadius, input2.y + tensorRadius)
            ctx.lineTo(input2.x + tensorRadius, input2.y + tensorRadius)
           
            ctx.closePath()
            ctx.fill()
            break
        case 6: // amass
            break
        case 7: // softmax
            break
        case 8: // hardmax
            break
        case 9: // max
            break
        case 10: // convolution
            break
        case 11: // squared dist
            break
        default:
            console.log("Invalid operator types")
            break
    }
}

function draw() {
    canvas.width = canvas.getBoundingClientRect().width
    canvas.height = canvas.getBoundingClientRect().height
    width = canvas.width
    height = canvas.height

    for (let i = 0; i < networks[0].tensors.length; i++) {
        drawTensor(networks[0], i)
    }

    for (let i = 0; i < networks[0].operators.length; i++) {
        drawOperator(networks[0], i)
    }

    window.requestAnimationFrame(draw);
}

// returns list of indices of tensors wit mouse init
function getHoveredTensorIndices() {
    grabbedList = []

    for (let i = 0; i < networks.length; i++) {
        for (let j = 0; j < networks[0].tensors.length; j++) {
            if (networks[i].tensors[j].x - tensorRadius < mouseX &&
                networks[i].tensors[j].x + tensorRadius > mouseX &&
                networks[i].tensors[j].y - tensorRadius < mouseY &&
                networks[i].tensors[j].y + tensorRadius > mouseY) {
                grabbedList.push(j)
            }
        }
    }

    return grabbedList
}

function doMouseDown(e) {
    down = true
    // console.log("Mouse position: ",mouseX," ", mouseY)
    let draggedList = getHoveredTensorIndices()

    if (draggedList.length != 0) {
        draggedIndex = draggedList[0]
    }
}

function doDoubleClick(e) {
    let clickedList = getHoveredTensorIndices()
    console.log("Clicked Indices ", clickedList)

    clickedList.forEach(i => networks[networkIndex].tensors[i].live )

    for (let i = 0; i < clickedList.length; i++) {
        clickedIndex = clickedList[i]
        networks[networkIndex].tensors[clickedIndex].live = !networks[networkIndex].tensors[clickedIndex].live
    }
}

function doMouseUp(e) {
    down = false
    draggedIndex = -1

    let clickedList = getHoveredTensorIndices()

    if (clickedList.length >= 2) {
        mergeTensors(clickedList[0], clickedList[1])
        // if either tensor are ghosts
    }
}

function mergeTensors(cind0, cind1) {
    if (!networks[networkIndex].tensors[cind1].live || !networks[networkIndex].tensors[cind1].live) {
        let t0 = networks[networkIndex].tensors[cind0]
        let t1 = networks[networkIndex].tensors[cind1]

        console.log(t0.output_of, t1.output_of)
        // t1 stays, t2 is deleted
        if (t0.output_of != null && t1.output_of == null) {
            console.log("t0")
            let ind = networks[networkIndex].operators[t0.output_of].inputs.indexOf(cind1)
            networks[networkIndex].operators[t0.output_of].inputs[ind] = cind0

            t0.input_of = t1.input_of
            deleteTensor(t1)
        }
        else if (t1.output_of == null && t0.output_of != null) {
            console.log("t1")
            let ind = networks[networkIndex].operators[t1.output_of].inputs.indexOf(cind0)
            networks[networkIndex].operators[t1.output_of].inputs[ind] = cind1

            t1.input_of = t0.input_of
            deleteTensor(t0)
        }
        else {
            console.log("There's an ish")
        }
    }
}

function deleteTensor(index) {
    // in operators, decrement input and output indices if greater than deleted indices
    for (let i = 0; i < networks[networkIndex].operators.length; i++) {
        for (let j = 0; j < networks[networkIndex].operators[i].inputs.length; j++) {
            if (networks[networkIndex].operators[i].inputs[j] > index) {
                networks[networkIndex].operators[i].inputs[j] -= 1
            }
        }
        for (let j = 0; j < networks[networkIndex].operators[i].outputs.length; j++) {
            if (networks[networkIndex].operators[i].outputs[j] > index) {
                networks[networkIndex].operators[i].outputs[j] -= 1
            }
        }
    }

    // delete relevant tensor
    return networks[networkIndex].tensors.splice(index, 1)
}

function doMouseMove(e) {
    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    // drag and drop
    if (draggedIndex != -1) {
        networks[networkIndex].tensors[draggedIndex].x = mouseX
        networks[networkIndex].tensors[draggedIndex].y = mouseY
    }
}

init();