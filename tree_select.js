
class network{
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
}

class node{
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

class func{
    constructor(name){
        this.name = name
    }
}

var function_table = Array.apply(null, Array(10)).map(function () {})

function_table[0] = new func("add")
function_table[1] = new func("subtract")
function_table[2] = new func("scale")
function_table[3] = new func("full")
function_table[4] = new func("amass")
function_table[5] = new func("softmax")
function_table[6] = new func("hardmax")
function_table[7] = new func("max")
function_table[8] = new func("convolution")
function_table[9] = new func("squared dist")

