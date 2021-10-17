
class Network{
    constructor(){
        this.tensors = [] //actual tensor objects
        this.operators = [] //actual operator objects

        this.input_tensors = []
        this.param_tensors = []
        this.output_tensors = []
    }

}

class Tensor{
    constructor() {
        this.scalar = false

        this.form = []

        this.x = 0;
        this.y = 0;
    }
}

class Operator{
    constructor(){
        this.inputs = []
        this.outputs = []

        this.func = 0
        this.network = null
    }
}







class Func{
    constructor(name){
        this.name = name
    }
}

var function_table = Array.apply(null, Array(12)).map(function () {})

function_table[0] = new Func("abstraction")
function_table[1] = new Func("identity")
function_table[2] = new Func("add")
function_table[3] = new Func("subtract")
function_table[4] = new Func("scale")
function_table[5] = new Func("full")
function_table[6] = new Func("amass")
function_table[7] = new Func("softmax")
function_table[8] = new Func("hardmax")
function_table[9] = new Func("max")
function_table[10] = new Func("convolution")
function_table[11] = new Func("squared dist")

