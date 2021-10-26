
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

    add_operator(op){

        var o = op.clone()

        this.operators.push(o);
        
        for(let i = 0; i < o.inputs.length; i++){
            this.tensors[o.inputs[i]].input_to.push(this.operators.length - 1)
        }
        
        for(let i = 0; i < o.outputs.length; i++){
            this.tensors[o.outputs[i]].output_of = this.operators.length - 1
        }
    }

    expand(){
        //assumes that network is alright, ok, and doin well
        //inner networks should never have parameter nodes (ok actually they should, but hold on, please just let me sleep)
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
                        var outer_inp = inner_net.input_tensors.indexOf(inner_net.operators[k].inputs[j])
                        var outer_out = inner_net.output_tensors.indexOf(inner_net.operators[k].inputs[j])
                        if(outer_inp != -1){
                            inner_net.operators[k].inputs[j] = this.operators[i].inputs[outer_inp]
                        }else if(outer_out != -1){
                            inner_net.operators[k].inputs[j] = this.operators[i].outputs[outer_out]
                        }else{
                            inner_net.operators[k].inputs[j] += offset
                        }
                    }
                    for(let j = 0; j < inner_net.operators[k].outputs.length; j++){
                        var outer_inp = inner_net.input_tensors.indexOf(inner_net.operators[k].outputs[j])
                        var outer_out = inner_net.output_tensors.indexOf(inner_net.operators[k].outputs[j])
                        if(outer_inp != -1){
                            inner_net.operators[k].outputs[j] = this.operators[i].inputs[outer_inp]
                        }else if(outer_out != -1){
                            inner_net.operators[k].outputs[j] = this.operators[i].outputs[outer_out]
                        }else{
                            inner_net.operators[k].outputs[j] += offset
                        }
                    }
                    this.add_operator(inner_net.operators[k])
                }
            }
        }
    }

    to_string(){

        var str = ""
        
        str += "Tensors: \n"
        
        for(let i = 0; i < this.tensors.length; i++){
            str += "\t"+i+":\n"

            str += "\t\tinput_to:\n"
            for(let k = 0; k < this.tensors[i].input_to.length; k++){
                str += "\t\t\t" + this.tensors[i].input_to[k] + "\n"
            }

            str += "\t\toutput_of\n"
            str += "\t\t\t"+this.tensors[i].output_of + "\n"
        }

        str += "Operators: \n"
        for(let i = 0; i < this.operators.length; i++){
            str += "\t"+i+":\n"

            str += "\t\tinputs:\n"
            for(let k = 0; k < this.operators[i].inputs.length; k++){
                str += "\t\t\t" + this.operators[i].inputs[k] + "\n"
            }

            str += "\t\toutputs:\n"
            for(let k = 0; k < this.operators[i].outputs.length; k++){
                str += "\t\t\t" + this.operators[i].outputs[k] + "\n"
            }

            str += "\t\tfunc: "+this.operators[i].func + "\n"
        }
        
        str += "input_tensors:\n"
        for(let i = 0; i < this.input_tensors.length; i++){
            str += "\t"+this.input_tensors[i]+"\n"
        }
        
        str += "param_tensors:\n"
        for(let i = 0; i < this.param_tensors.length; i++){
            str += "\t"+this.param_tensors[i]+"\n"
        }
        
        str += "output_tensors:\n"
        for(let i = 0; i < this.output_tensors.length; i++){
            str += "\t"+this.output_tensors[i]+"\n"
        }

        return str
    }
}

class Tensor{
    constructor(notghost) {
        this.scalar = false
        this.ghost = !notghost

        this.form = []

        this.x = 0;
        this.y = 0;

        this.input_to = []
        this.output_of = null;
    }
}

class Operator{
    constructor(func){
        this.inputs = []
        this.outputs = []

        this.func = func
        this.network = null
    }
    clone(){
        var clone = new Operator(this.func)
        clone.inputs = [...this.inputs]
        clone.outputs = [...this.outputs]
        clone.network = this.network
        return clone
    }
}







class Func{
    constructor(name, num_inputs){
        this.name = name
        this.num_inputs = num_inputs
    }
    //takes array of tensors, 
    //returns array of output forms
    calc_form(inputs){
        var out = []

        switch(this.name){
            case "identity":
                out.push(inputs[0].form)
                break
            case "add":
                out.push(inputs[0].form)
                break
            case "subtract":
                out.push(inputs[0].form)
                break   
            case "scale":
                out.push(inputs[0].form)
                break
            case "full":
                form1 = inputs[0].form
                form2 = inputs[1].form

                form1_total = 1
                for(let i = 0; i < form1.length; i++){
                    form1_total *= form1[i]
                }
                form2_total = 1
                for(let i = 0; i < form2.length; i++){
                    form2_total *= form2[i]
                }

                var out_form = []
                out_form.push(form2_total/form1_total)
                
                out.push(out_form)
                break
            case "amass":
                var out_form = []
                out_form.push(1)
                
                out.push(out_form)
                break
            case "softmax":
                out.push(inputs[0].form)
                break
            case "hardmax":
                out.push(inputs[0].form)
                break
            case "max":
                var out_form = []
                out_form.push(1)
                
                out.push(out_form)
                break
            case "full":
                form1 = inputs[0].form
                form2 = inputs[1].form
                var out_form = []

                
                for(let i = 0; i < form1.length; i++){
                    if(form2.length <= i){
                        out_form.push(form1[i])
                    }else{
                        out_form.push(form1[i] - form2[i] + 1)
                    }
                }
                
                out.push(out_form)
                break
                

        }

        return out
    }
}

var function_table = Array.apply(null, Array(12)).map(function () {})

function_table[0] = new Func("abstraction", 0)
function_table[1] = new Func("identity", 1)
function_table[2] = new Func("add", 2)
function_table[3] = new Func("subtract", 2)
function_table[4] = new Func("scale", 2)
function_table[5] = new Func("full", 2)
function_table[6] = new Func("amass", 1)
function_table[7] = new Func("softmax", 1)
function_table[8] = new Func("hardmax", 1)
function_table[9] = new Func("max", 1)
function_table[10] = new Func("convolution", 2)
function_table[11] = new Func("squared dist", 2)