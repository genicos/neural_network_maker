
class Network{
    constructor(){
        this.tensors = [] //actual tensor objects
        this.operators = [] //actual operator objects

        this.input_tensors = []
        this.param_tensors = []
        this.output_tensors = []
    }
    add_tensor(t){
        this.tensors.push(t);
    }
    add_operator(o){
        this.operators.push(o);
    }
    expand(){
        //assumes that network is alright, ok, and doin well
        //inner networks should never have parameter nodes
        for(let i = 0; i < this.operators.length; i++){
            if(this.operators[i].func == 0 && this.operators[i].network){
                var inner_net = this.operators[i].network;
                inner_net.expand();
                var offset = this.tensors.length - inner_net.input_tensors.length - inner_net.output_tensors.length;
                for(let k = 0; k < inner_net.tensors.length; k++){
                    if(!inner_net.input_tensors.includes(k) && !inner_net.output_tensors.includes(k)){
                        this.add_tensor(inner_net.tensors[k]);
                    }
                }
                for(let k = 0; k < inner_net.operators.length; k++){
                    for(let j = 0; j < inner_net.operators[k].inputs.length; j++){
                        var outer_inp = inner_net.inputs.indexOf(inner_net.operators[k].inputs[j])
                        var outer_out = inner_net.outputs.indexOf(inner_net.operators[k].inputs[j])
                        if(outer_inp != -1){
                            inner_net.operators[k].inputs[j] = this.operators[i].inputs[outer_inp]
                        }else if(outer_out != -1){
                            inner_net.operators[k].inputs[j] = this.operators[i].outputs[outer_out]
                        }else{
                            inner_net.operators[k].inputs[j] += offset
                        }
                    }
                    for(let j = 0; j < inner_net.operators[k].outputs.length; j++){
                        var outer_inp = inner_net.inputs.indexOf(inner_net.operators[k].outputs[j])
                        var outer_out = inner_net.outputs.indexOf(inner_net.operators[k].outputs[j])
                        if(outer_inp != -1){
                            inner_net.operators[k].outputs[j] = this.operators[i].inputs[outer_inp]
                        }else if(outer_out != -1){
                            inner_net.operators[k].outputs[j] = this.operators[i].outputs[outer_out]
                        }else{
                            inner_net.operators[k].outputs[j] += offset
                        }
                    }
                    this.add_operator(inner.operators[k])
                }
            }
        }
    }
}

class Tensor{
    constructor() {
        this.scalar = false
        this.ghost = true

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

