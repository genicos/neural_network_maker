function create_code(network){

    network.expand()

    var code = ""


    //First, we determine an order of operators that causes no dependency hazards
    var ordered_operators = []
    var computed_tensors = network.input_tensors

    while(computed_tensors.length != 0){
        var no_computation = true

        //find operators which can now be computed
        for(let i = 0; i < network.operators.length; i++){

            //only check operators we have not already computed
            if(!ordered_operators.includes(i)){
                var all_inputs_are_computed = true

                //check if all inputs have been computed
                for(let k = 0; k < network.operators[i].inputs.length; k++){
                    if(!computed_tensors.includes(network.operators[i].inputs[k])){
                        all_inputs_are_computed = false
                    }
                }

                //if all inputs have been computed, then the operator may be computed
                // and all of the operators outputs can be computed
                if(all_inputs_are_computed){
                    no_computation = false

                    ordered_operators.push(i)


                    out_forms = function_table[network.operators[i].func].calc_form(network.operators[i].inputs, network)

                    for(let k = 0; k < network.operators[i].outputs.length; k++){
                        computed_tensors.push(network.operators[i].outputs[k])


                        network.tensors[network.operators[i].outputs[k]].form = out_forms[k]
                    }
                }
            }
        }

        if(computed_tensors.length == network.input_tensors.length){
            break
        }else if(no_computation){
            //If we can perform no more computations, and we have not computed every tensor
            // then the network is ill-formed
            return false;
        }
    }

    for(let i = 0; i < network.tensors.length; i++){
        
        network.tensors[i].calc_size()
        if(network.tensors[i].size == 0){

        }else if(network.tensors[i].size == 1){
            code += "float t"+String(i)+ ";\n"
        }else{
            code += "float t"+String(i)+ "["+String(network.tensors[i].size)+"];\n"
        }
        
    }

    for(let i = 0; i < ordered_operators.length;i++){
        var this_op = network.operators[ordered_operators[i]]

        if(this_op.func == 2){
            code += "// Operator "+ ordered_operators[i] + ", tensor addition\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] + t"+this_op.inputs[1]+"[i];\n"
            code += "}\n"
        }

        if(this_op.func == 3){
            code += "// Operator "+ ordered_operators[i] + ", tensor subtraction\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] - t"+this_op.inputs[1]+"[i];\n"
            code += "}\n"
        }
        if(this_op.func == 4){
            code += "// Operator "+ ordered_operators[i] + ", tensor scale\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] * t"+this_op.inputs[1]+";\n"
            code += "}\n"
        }

        if(this_op.func == 5){
            code += "// Operator "+ ordered_operators[i] + ", fully connected layer\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0] +"[i] = 0;\n"
            code += "    for(uint j = 0; j < " + network.tensors[this_op.inputs[0]].size + "; j++){\n"
            code += "        t"+this_op.outputs[0] +"[i] += t"+this_op.inputs[0] +"[j] * t"+this_op.inputs[1] +"[i*"+network.tensors[this_op.inputs[0]].size+" + j];\n"
            code += "    }\n"
            code += "}\n"
        }

        if(this_op.func == 6){
            code += "// Operator "+ ordered_operators[i] + ", amass\n"
            code += "t"+this_op.outputs[0]+" = 0;\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0]+" += t"+this_op.inputs[0]+"[i];\n"
            code += "}\n"
        }

        //Softmax is not done, gonna be hard
        //maybe rethink what a softmax even is!
        if(this_op.func == 7){
            code += "// Operator "+ ordered_operators[i] + ", softmax\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "    t"+this_op.outputs[0]+" += t"+this_op.inputs[0]+"[i];\n"
            code += "}\n"
        }

        //Gotta replace -infinity with something
        //I actually wrote the in-place version here, i should replace it
        if(this_op.func == 8){
            code += "// Operator "+ ordered_operators[i] + ", hardmax\n"
            code += "float temp"+ordered_operators[i] + " = -infinity;\n"
            code += "for(uint i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "    if(temp"+ordered_operators[i] + " >= t"+this_op.inputs[0]+"){\n"
            code += "        t"+this_op.inputs[0]+"[i] = 0;\n"
            code += "    }else{\n"
            code += "        temp"+ordered_operators[i] + " = t"+this_op.inputs[0]+"[i];\n"
            code += "    }\n"
            code += "}\n"
        }

        
        
    }

    return code
}