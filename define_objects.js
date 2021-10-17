
class Network{
    constructor(){
        this.num_nodes = 0
        this.nodes = []

        this.input_nodes = []
        this.param_nodes = []
        this.output_nodes = []
        this.transient_nodes = []

        this.x = 0;
        this.y = 0;
    }

    add_node(n){
        this.num_nodes += 1
        this.nodes.push(n)
    }
}

class Node{
    constructor(){
        this.parent_1 = 0;
        this.parent_2 = 0;

        this.num_children = 0;
        this.children = []

        this.function = 0;
        this.x = 0;
        this.y = 0;
    }
}

class Func{
    constructor(name){
        this.name = name
    }
}

var function_table = Array.apply(null, Array(10)).map(function () {})

function_table[0] = new Func("add")
function_table[1] = new Func("subtract")
function_table[2] = new Func("scale")
function_table[3] = new Func("full")
function_table[4] = new Func("amass")
function_table[5] = new Func("softmax")
function_table[6] = new Func("hardmax")
function_table[7] = new Func("max")
function_table[8] = new Func("convolution")
function_table[9] = new Func("squared dist")

