function create_function_code(network){

    network.expand()

    var code = ""
    code += "#include <float.h>\n"
    code += "#include <inttypes.h>\n\n"

    



    //First, we determine an order of operators that causes no dependency hazards
    var ordered_operators = []
    var computed_tensors = network.input_tensors.concat(network.param_tensors)


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
                console.log("i:"+i)
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

        if(computed_tensors.length == network.tensors.length){
            
            break
        }else if(no_computation){
            //If we can perform no more computations, and we have not computed every tensor
            // then the network is ill-formed
            return false;
        }
    }

    


    //TODO sometimes it will need to return a float **, when theres multiple outputs"
    //TODO sometimes it will need to return a float *, when theres one output"
    //TODO sometimes it will need to return a float , when theres one scalar outputs"
    code += "float **network_execute("

    
    for(let i  = 0; i < network.input_tensors.length; i++){
        code += "float "
        if(network.tensors[network.input_tensors[i]].calc_size() > 1){
            code += "*"
        }
        code += "t"+network.input_tensors[i]
        code += ", "
    }
    for(let i  = 0; i < network.output_tensors.length; i++){
        code += "float *t"+network.output_tensors[i]
        if(i < network.output_tensors.length - 1){
            code += ", "
        }
    }
    
    code += "){\n"

    for(let i = 0; i < network.tensors.length; i++){

        if(!network.input_tensors.includes(i) && !network.output_tensors.includes(i)){
            network.tensors[i].calc_size()
            if(network.tensors[i].size == 0){

            }else if(network.tensors[i].size == 1){
                code += "    float t"+String(i)+ ";\n"
            }else{
                code += "    float t"+String(i)+ "["+String(network.tensors[i].size)+"];\n"
            }
        }

    }

    for(let i = 0; i < ordered_operators.length;i++){
        var this_op = network.operators[ordered_operators[i]]
        code += "    \n"

        if(this_op.func == 2){
            code += "    // Operator "+ ordered_operators[i] + ", tensor addition\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] + t"+this_op.inputs[1]+"[i];\n"
            code += "    }\n"
        }

        if(this_op.func == 3){
            code += "    // Operator "+ ordered_operators[i] + ", tensor subtraction\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] - t"+this_op.inputs[1]+"[i];\n"
            code += "    }\n"
        }

        if(this_op.func == 4){
            code += "    // Operator "+ ordered_operators[i] + ", tensor scale\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] * t"+this_op.inputs[1]+";\n"
            code += "    }\n"
        }

        if(this_op.func == 5){
            code += "    // Operator "+ ordered_operators[i] + ", fully connected layer\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0] +"[i] = 0;\n"
            code += "        for(uint32_t j = 0; j < " + network.tensors[this_op.inputs[0]].size + "; j++){\n"
            code += "            t"+this_op.outputs[0] +"[i] += t"+this_op.inputs[0] +"[j] * t"+this_op.inputs[1] +"[i*"+network.tensors[this_op.inputs[0]].size+" + j];\n"
            code += "        }\n"
            code += "    }\n"
        }

        if(this_op.func == 6){
            var treatment = ""
            if(network.output_tensors.includes(this_op.outputs[0])){
                treatment = "[0]"
            }

            code += "    // Operator "+ ordered_operators[i] + ", amass\n"
            code += "    t"+this_op.outputs[0]+treatment+" = 0;\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0]+treatment+" += t"+this_op.inputs[0]+"[i];\n"
            code += "    }\n"
        }

        
        if(this_op.func == 7){
            code += "    // Operator "+ ordered_operators[i] + ", softmax\n"
            code += "    float temp"+ordered_operators[i]+"_powersum = 0;\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        temp"+ordered_operators[i]+"_powersum += 2 << t"+this_op.inputs[0]+"[i];\n"
            code += "    }\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0]+"[i]  = (2 << t"+this_op.inputs[0]+"[i]) / temp"+ordered_operators[i]+"_powersum;\n"
            code += "    }\n"
        }


        
        if(this_op.func == 8){
            code += "    // Operator "+ ordered_operators[i] + ", hardmax\n"
            code += "    float temp"+ordered_operators[i] + "_maxvalue = FLT_MIN;\n"
            code += "    uint32_t temp"+ordered_operators[i]+"_maxindex = 0;\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        if(temp"+ordered_operators[i] + "_maxvalue < t"+this_op.inputs[0]+"[i]){\n"
            code += "            temp"+ordered_operators[i] + "_maxvalue = t"+this_op.inputs[0]+"[i];\n"
            code += "            temp"+ordered_operators[i] +"_maxindex = i;\n"
            code += "        }\n"
            code += "    }\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
            code += "        t"+this_op.outputs[0] +"[i] = 0;\n"
            code += "    }\n"
            code += "    t"+this_op.outputs[0] +"[temp"+ordered_operators[i]+"_maxindex] = temp"+ordered_operators[i] + "_maxvalue;\n"
        }

        
        if(this_op.func == 9){
            var treatment = ""
            if(network.output_tensors.includes(this_op.outputs[0])){
                treatment = "[0]"
            }

            code += "    // Operator "+ ordered_operators[i] + ", max\n"
            code += "    t"+this_op.outputs[0]+treatment+" = FLT_MIN;\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        if(t"+this_op.outputs[0]+treatment+" < t"+this_op.inputs[0]+"[i]){\n"
            code += "            t"+this_op.outputs[0]+treatment+" = t"+this_op.inputs[0]+"[i];\n"
            code += "        }\n"
            code += "    }\n"
        }

        
        if(this_op.func == 10){

            output_form_cascade = []
            if(network.tensors[this_op.outputs[0]].form.length > 1){
                output_form_cascade.push(network.tensors[this_op.outputs[0]].size / network.tensors[this_op.outputs[0]].form[0])
                for(let j = 1; j < network.tensors[this_op.outputs[0]].form.length; j++){
                    output_form_cascade.push(output_form_cascade[j-1] / network.tensors[this_op.outputs[0]].form[j])
                }
            }

            input_form_cascade = []
            if(network.tensors[this_op.inputs[0]].form.length > 1){
                input_form_cascade.push(network.tensors[this_op.inputs[0]].size / network.tensors[this_op.inputs[0]].form[0])
                for(let j = 1; j < network.tensors[this_op.inputs[0]].form.length; j++){
                    input_form_cascade.push(input_form_cascade[j-1] / network.tensors[this_op.inputs[0]].form[j])
                }
            }

            parameter_form_cascade = []
            if(network.tensors[this_op.inputs[1]].form.length > 1){
                parameter_form_cascade.push(network.tensors[this_op.inputs[1]].size / network.tensors[this_op.inputs[1]].form[0])
                for(let j = 1; j < network.tensors[this_op.inputs[1]].form.length; j++){
                    parameter_form_cascade.push(parameter_form_cascade[j-1] / network.tensors[this_op.inputs[1]].form[j])
                }
            }


            code += "    // Operator "+ordered_operators[i]+", convolution\n"
            for(let j = 0; j < network.tensors[this_op.outputs[0]].form.length; j++){
                code += "    "
                for(let k = 0; k < j; k++){
                    code += "    "
                }
                code += "for(uint32_t i"+j+" = 0; i"+j+" < " + network.tensors[this_op.outputs[0]].form[j] + "; i"+j+"++){\n"
            }

            code += "    "
            for(let k = 0; k < network.tensors[this_op.outputs[0]].form.length; k++){
                code += "    "
            }
            
            //set output to 0
            code += "t"+this_op.outputs[0]+ "["
            for(let k = 0; k < network.tensors[this_op.inputs[0]].form.length; k++){
                code += "i"+k+"*"+output_form_cascade[k]
                if(k < network.tensors[this_op.inputs[0]].form.length - 1){
                    code += " + "
                }
            }
            code += "] = 0;\n"

            for(let j = 0; j < network.tensors[this_op.inputs[1]].form.length; j++){
                code += "    "
                for(let k = 0; k < network.tensors[this_op.inputs[1]].form.length + j; k++){
                    code += "    "
                }
                code += "for(uint32_t j"+j+" = 0; j"+j+" < " + network.tensors[this_op.inputs[1]].form[j] + "; j"+j+"++){\n"
            }

            code += "    "
            for(let k = 0; k < network.tensors[this_op.inputs[0]].form.length * 2; k++){
                code += "    "
            }

            //We are now inside all for loops

            //output access
            code += "t"+this_op.outputs[0]+ "["
            for(let k = 0; k < network.tensors[this_op.inputs[0]].form.length; k++){
                code += "i"+k+"*"+output_form_cascade[k]
                if(k < network.tensors[this_op.inputs[0]].form.length - 1){
                    code += " + "
                }
            }
            code += "] += "

            //input access
            code += "t"+this_op.inputs[0]+ "["
            for(let k = 0; k < network.tensors[this_op.inputs[0]].form.length; k++){
                code += "(i"+k+" + j"+k+")*"+input_form_cascade[k]
                if(k < network.tensors[this_op.inputs[0]].form.length - 1){
                    code += " + "
                }
            }
            code += "] * "

            //parameter access
            code += "t"+this_op.inputs[1]+ "["
            for(let k = 0; k < network.tensors[this_op.inputs[0]].form.length; k++){
                code += "j"+k+"*"+parameter_form_cascade[k]
                if(k < network.tensors[this_op.inputs[0]].form.length - 1){
                    code += " + "
                }
            }
            code += "];\n"

            //closing inner loops
            for(let j = 0; j < network.tensors[this_op.inputs[1]].form.length; j++){
                code += "    "
                for(let k = 0; k < network.tensors[this_op.inputs[1]].form.length * 2 - j - 1; k++){
                    code += "    "
                }
                code += "}\n"
            }

            code += "    "
            for(let k = 0; k < network.tensors[this_op.outputs[0]].form.length; k++){
                code += "    "
            }
            code +="\n"

            //Closing outer loops
            for(let j = 0; j < network.tensors[this_op.outputs[0]].form.length; j++){
                code += "    "
                for(let k = 0; k < network.tensors[this_op.outputs[0]].form.length - j - 1; k++){
                    code += "    "
                }
                code += "}\n"
            }
        }

        if(this_op.func == 11){
            var treatment = ""
            if(network.output_tensors.includes(this_op.outputs[0])){
                treatment = "[0]"
            }

            code += "    // Operator "+ ordered_operators[i] + ", squared distance\n"
            code += "    t"+this_op.outputs[0]+treatment+" = 0;\n"
            code += "    float temp"+ordered_operators[i]+";\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        temp"+ordered_operators[i]+" = t"+this_op.inputs[0]+"[i] - t"+this_op.inputs[1]+";\n"
            code += "        t"+this_op.outputs[0]+treatment+" += temp"+ordered_operators[i]+" * temp"+ordered_operators[i]+";\n"
            code += "    }\n"
        }

        if(this_op.func == 12 || this_op.func == 14){
            code += "    // Operator "+ ordered_operators[i] + ", ReLU\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        if(t"+this_op.inputs[0]+"[i] > 0){\n"
            code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i];\n"
            code += "        }else{\n"
            code += "            t"+this_op.outputs[0]+"[i] = 0;\n"
            code += "        }\n"
            code += "    }\n"
        }

        if(this_op.func == 13){
            code += "    // Operator "+ ordered_operators[i] + ", Leaky ReLU\n"
            code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
            code += "        if(t"+this_op.inputs[0]+"[i] >= 0){\n"
            code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i];\n"
            code += "        }else{\n"
            code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] * 0.1;\n"
            code += "        }\n"
            code += "    }\n"
        }


    }
    code += "}\n"
    return code
}










function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}




//Holds information on what needs to be calculated for a particular operator
class operator_handle{
    operator(index, partials, evaluate, out_partial){
        this.index = index       //operators index in network
        this.partials = partials //list of booleans, if true, this input needs partial calculated
        this.evaluate = evaluate //bool, if true, need to evaluate outputs of this operator
        this.out_partial = out_partial //bool, true if one of partials is true
    }
}





//This code currently assumes one ouput per operator, which may change in the future
function create_derivative_code(network){

    network.expand()

    code = ""
    code += "#include <float.h>\n"
    code += "#include <inttypes.h>\n\n"

    //First, we determine an order of operators that causes no dependency hazards
    //and we determine if we need to calculate the partial derivatives, and if we need to evaluate
    var ordered_operators = []
    var operator_handles = []
    for(let i = 0; i < network.operators.length; i++){
        operator_handles.push(new operator_handle(i,[],false, false))
    }
    var computed_tensors = network.input_tensors.concat(network.truth_tensors, network.param_tensors)





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
                    

                    //Finding out which inputs need a partial derivative
                    var partials = []
                    var out_partial = false

                    for(let k = 0; k < network.operators[i].inputs.length; k++){
                        var this_tensor = network.operators[i].inputs[k]

                        //this feels ugly
                        if(network.param_tensors.includes(this_tensor)){
                            partials.push(true)
                            out_partial = true
                        }else if(network.tensors[this_tensor].output_of != null){
                            if(operator_handles[network.tensors[this_tensor].output_of].out_partial){
                                partials.push(true)
                                out_partial = true
                            }else{
                                partials.push(false)
                            }
                        }else{
                            partials.push(false)
                        }

                    }

                    var evaluate = (network.loss != network.operators[i].outputs[0])
                    operator_handles[i].partials = partials
                    operator_handles[i].evaluate = evaluate
                    operator_handles[i].out_partial = out_partial


                    
                    out_forms = function_table[network.operators[i].func].calc_form(network.operators[i].inputs, network)
                    
                    for(let k = 0; k < network.operators[i].outputs.length; k++){
                        computed_tensors.push(network.operators[i].outputs[k])

                        console.log("Setting form of " + network.operators[i].outputs[k])
                        network.tensors[network.operators[i].outputs[k]].form = out_forms[k]
                        console.log("New form: ")
                        console.log(network.tensors[network.operators[i].outputs[k]].form)
                    }
                }
            }
        }

        if(computed_tensors.length == network.tensors.length){
            break
        }else if(no_computation){
            //If we can perform no more computations, and we have not computed every tensor
            // then the network is ill-formed
            return false;
        }
    }

    


    code += "void network_descend(){\n"

    for(let i = 0; i < network.tensors.length; i++){
        network.tensors[i].calc_size()

        if(!network.input_tensors.includes(i) && !network.output_tensors.includes(i)){
            network.tensors[i].calc_size()
            if(network.tensors[i].size == 0){

            }else if(network.tensors[i].size == 1){
                code += "    float t"+String(i)+ ";\n"
            }else{
                code += "    float t"+String(i)+ "["+String(network.tensors[i].size)+"];\n"
            }
        }
    }

    for(let i = 0; i < network.operators.length; i++){
        for(let j = 0; j < operator_handles[i].partials.length; j++){
            if(operator_handles[i].partials[j]){
                // relevant to multiple outputs, this assumes one output
                var partial_size = network.tensors[network.operators[i].outputs[0]].size * network.tensors[network.operators[i].inputs[j]].size
                
                if(partial_size == 0){

                }else if(partial_size == 1){
                    code += "    float d"+String(network.operators[i].outputs[0])+"d"+String(network.operators[i].inputs[j]) +";\n"
                }else{
                    code += "    float d"+String(network.operators[i].outputs[0])+"d"+String(network.operators[i].inputs[j]) + "["+partial_size+"];\n"
                }
            }
        }
    }

    for(let i = 0; i < ordered_operators.length;i++){
        var this_op = network.operators[ordered_operators[i]]
        var this_handle = operator_handles[ordered_operators[i]]
        var output_size = network.tensors[this_op.outputs[0]].size
        var input_0_size = network.tensors[this_op.inputs[0]].size
        var input_1_size = 0
        if(this_op.inputs.length > 1){
            input_1_size = network.tensors[this_op.inputs[0]].size
        }
        code += "    \n"

        if(this_op.func == 2){
            code += "    // Operator "+ ordered_operators[i] + ", tensor addition\n"
            if(this_handle.evaluate){
                code += "    // evaluation\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
                code += "        t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] + t"+this_op.inputs[1]+"[i];\n"
                code += "    }\n"
            }
            if(this_handle.out_partial){
                code += "    // partial derivative\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size * network.tensors[this_op.inputs[0]].size + "; i++){\n"
                if(this_handle.partials[0]){
                    code += "        d"+this_op.outputs[0]+"d"+this_op.inputs[0] + "[i] = 1;\n"
                }
                if(this_handle.partials[1]){
                    code += "        d"+this_op.outputs[0]+"d"+this_op.inputs[1] + "[i] = 1;\n"
                }
                code += "    }\n"
            }
        }

        if(this_op.func == 3){
            code += "    // Operator "+ ordered_operators[i] + ", tensor subtraction\n"
            if(this_handle.evaluate){
                code += "    // evaluation\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
                code += "        t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] - t"+this_op.inputs[1]+"[i];\n"
                code += "    }\n"
            }
            if(this_handle.out_partial){
                code += "    // partial derivative\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size * network.tensors[this_op.inputs[0]].size + "; i++){\n"
                if(this_handle.partials[0]){
                    code += "        d"+this_op.outputs[0]+"d"+this_op.inputs[0] + "[i] = 1;\n"
                }
                if(this_handle.partials[1]){
                    code += "        d"+this_op.outputs[0]+"d"+this_op.inputs[1] + "[i] = -1;\n"
                }
                code += "    }\n"
            }
        }

        if(this_op.func == 5){
            code += "    // Operator "+ ordered_operators[i] + ", fully connected layer\n"
            if(this_handle.evaluate){
                code += "    // evaluation\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.outputs[0]].size + "; i++){\n"
                code += "        t"+this_op.outputs[0] +"[i] = 0;\n"
                code += "        for(uint32_t j = 0; j < " + network.tensors[this_op.inputs[0]].size + "; j++){\n"
                code += "            t"+this_op.outputs[0] +"[i] += t"+this_op.inputs[0] +"[j] * t"+this_op.inputs[1] +"[i*"+network.tensors[this_op.inputs[0]].size+" + j];\n"
                code += "        }\n"
                code += "    }\n"
            }
            if(this_handle.out_partial){
                code += "    // partial derivative\n"
                if(this_handle.partials[0]){
                    //PROBLEM: if i use in-place algorithms this may rewrite data that i need
                    //would i use in-place for full layer tho?
                    code += "    d"+this_op.outputs[0]+"d"+this_op.inputs[0]+" = t"+this_op.inputs[1]+";\n"
                }
                if(this_handle.partials[1]){
                    code += "    for(uint32_t i = 0; i < "+ output_size + "; i++){\n"
                    code += "        for(uint32_t j = 0; j < "+ output_size + "; j++){\n"
                    code += "            for(uint32_t k = 0; k < "+ input_0_size + " k++){\n"
                    code += "                if(i == j){\n"
                    code += "                    d"+this_op.outputs[0]+"d"+this_op.inputs[1] + "[i*" + (output_size*input_0_size) + " + j*"+input_0_size+" + k] = 0;\n"
                    code += "                }else{\n"
                    code += "                    d"+this_op.outputs[0]+"d"+this_op.inputs[1] + "[i*" + (output_size*input_0_size) + " + j*"+input_0_size+" + k] = t"+this_op.inputs[0]+"[k];\n"
                    code += "                }\n"
                    code += "            }\n"
                    code += "        }\n"
                    code += "    }\n"
                }
            }
        }

        if(this_op.func == 12){
            code += "    // Operator "+ ordered_operators[i] + ", ReLU\n"
            if(this_handle.evaluate){
                code += "    // evaluation\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
                code += "        if(t"+this_op.inputs[0]+"[i] > 0){\n"
                code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i];\n"
                code += "        }else{\n"
                code += "            t"+this_op.outputs[0]+"[i] = 0;\n"
                code += "        }\n"
                code += "    }\n"
            }
            if(this_handle.out_partial){
                code += "    // partial derivative\n"
                code += "    for(uint32_t i = 0; i < "+input_0_size+"; i++){\n"
                code += "        if(t"+this_op.inputs[0]+"[i] > 0){\n"
                code += "            d"+this_op.outputs[0]+"d"+this_op.inputs[0]+"[i] = 1;\n"
                code += "        }else{\n"
                code += "            d"+this_op.outputs[0]+"d"+this_op.inputs[0]+"[i] = 0;\n"
                code += "        }\n"
                code += "    }\n"
            }
        }

        if(this_op.func == 13 || this_op.func == 14){
            code += "    // Operator "+ ordered_operators[i] + ", Leaky ReLU\n"
            if(this_handle.evaluate){
                code += "    // evaluation\n"
                code += "    for(uint32_t i = 0; i < " + network.tensors[this_op.inputs[0]].size + "; i++){\n"
                code += "        if(t"+this_op.inputs[0]+"[i] > 0){\n"
                code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i];\n"
                code += "        }else{\n"
                code += "            t"+this_op.outputs[0]+"[i] = t"+this_op.inputs[0]+"[i] * 0.1;\n"
                code += "        }\n"
                code += "    }\n"
            }
            if(this_handle.out_partial){
                code += "    // partial derivative\n"
                code += "    for(uint32_t i = 0; i < "+input_0_size+"; i++){\n"
                code += "        if(t"+this_op.inputs[0]+"[i] > 0){\n"
                code += "            d"+this_op.outputs[0]+"d"+this_op.inputs[0]+"[i] = 1;\n"
                code += "        }else{\n"
                code += "            d"+this_op.outputs[0]+"d"+this_op.inputs[0]+"[i] = 0.1;\n"
                code += "        }\n"
                code += "    }\n"
            }
        }

    }


    code += "    \n"


    parameter_threads = []
    running_threads = []

    for(let i = 0; i < network.param_tensors.length; i++){
        running_threads.push([network.param_tensors[i]])
    }

    
    while(running_threads.length > 0){
        

        last_tensor_in_thread = network.tensors[running_threads[0][running_threads[0].length - 1]]
        
        if(network.loss == running_threads[0][running_threads[0].length - 1]){
            parameter_threads.push(running_threads[0])
            running_threads.splice(0, 1)
            continue
        }

        for(let j = 0; j < last_tensor_in_thread.input_to.length; j++){
            input_to_operator = network.operators[last_tensor_in_thread.input_to[j]]
            
            
            for(let k = 0; k < input_to_operator.outputs.length; k++){
                running_threads.push([...running_threads[0]])
                running_threads[running_threads.length - 1].push(input_to_operator.outputs[k])
            }
            

        }

        running_threads.splice(0, 1)

    }

    for(let i = 0; i < parameter_threads.length; i++){
        console.log(parameter_threads[i])
    }








    //What if i pass 
    //  0,1,2
    //  0,2
    //?????oh man Call this the ADJACENCY PROBLEM
    //
    //if path is undefined, do normal naming conventions
    //if path is a number, append number to name
    //
    //I assume max_pair would only appear in a single thread once
    // (Is this a safe assumption???)
    function chain_rule(threads, path){
        var code = ""

        if(threads.length == 1){
            //base case
            if(threads[0].length <= 2){
                return code
            }

            for(let i = 2; i < threads[0].length; i++){
                code += "    // chain rule\n"
                if(typeof path !== 'undefined' && i == threads[0].length - 1){
                    code += "    float d"+threads[0][i]+"d"+threads[0][0]+"_path"+path+"["+(network.tensors[threads[0][i]].size +"]["+ network.tensors[threads[0][0]].size)+"];\n"
                }else{
                    code += "    float d"+threads[0][i]+"d"+threads[0][0]+"["+network.tensors[threads[0][i]].size +"]["+ network.tensors[threads[0][0]].size+"];\n"
                }
                
                code += "    for(uint32_t i = 0; i < " + network.tensors[threads[0][i]].size + "; i++){\n"
                code += "        for(uint32_t k = 0; k < " + network.tensors[threads[0][0]].size + "; k++){\n"
                code += "            float sum = 0;\n"
                code += "            for(uint32_t j = 0; j < " + network.tensors[threads[0][i-1]].size + "; j++){\n"
                code += "                sum += d"+threads[0][i-1]+"d"+threads[0][0]+"[i][j] * d"+threads[0][i]+"d"+threads[0][i-1]+"[j][k];\n"
                code += "            }\n"

                if(typeof path !== 'undefined' && i == threads[0].length - 1){
                    code += "            d"+threads[0][i]+"d"+threads[0][0]+"_path"+path+"[i][k]"
                }else{
                    code += "            d"+threads[0][i]+"d"+threads[0][0]+"[i][k]"
                }
                code += " = sum;\n"
                code += "        }\n"
                code += "    }\n"
                code += "\n"
            }
            
            return code
        }

        var multi_path = true

        //A multi_path requires that all threads have the same
        // first element and the same last element
        var first_element = threads[0][0]
        var last_element = threads[0][threads[0].length - 1]
        for(let i = 1; multi_path && i < threads.length; i++){
            if(threads[i][0] != first_element){
                multi_path = false
            }
            if(threads[i][threads[i].length -1] != last_element){
                multi_path = false
            }
        }
        
        var node_pair_table = new Object()

        var max_pair = []
        var max_value = 0;

        for(let i = 0; i < threads.length; i++){
            for(let j = 0; j < threads[i].length - 2; j++){

                //do not check first and last if multi_path is true
                var top_to_check = (multi_path && j == 0)? threads[i].length - 1 : threads[i].length;

                for(let k = j+2; k < top_to_check; k++){
                    var t1 = threads[i][j]
                    var t2 = threads[i][k]
                    if([t1,t2] in node_pair_table){
                        node_pair_table[[t1,t2]] = node_pair_table[[t1,t2]] + 1
                    }else{
                        node_pair_table[[t1,t2]] = 1
                    }
                    if(node_pair_table[[t1,t2]] > max_value){
                        max_pair = [t1,t2]
                        max_value = node_pair_table[[t1,t2]]
                    }
                }
            }
        }

        
        //In this case, we recurse with a multipath
        if(max_value > 1){

            var new_threads = []
            var multi_path_threads = []

            for(let i = 0; i < threads.length; i++){

                var potential_thread = []

                for(let j = 0; j < threads[i].length - 2; j++){
                    
                    if(threads[i][j] == max_pair[0]){

                        
                        //ADJACENCY PROBLEM is relevent here
                        for(let k = j; k < threads[i].length; k++){
                            
                            potential_thread.push(threads[i][k])
                            if(threads[i][k] == max_pair[1]){

                                //Dont add repeats
                                var repeated = false
                                for(let h = 0; h < multi_path_threads.length; h++){
                                    if(arraysEqual(multi_path_threads[h],potential_thread)){
                                        repeated = true
                                    }
                                }
                                if(!repeated){
                                    multi_path_threads.push(potential_thread)
                                }

                                var trimmed_thread = []
                                for(let h = 0; h < threads[i].length; h++){
                                    if(h <= j || h >= k){
                                        trimmed_thread.push(threads[i][h])
                                    }
                                }
                                repeated = false
                                for(let h = 0; h < new_threads.length; h++){
                                    if(arraysEqual(new_threads[h],trimmed_thread)){
                                        repeated = true
                                    }
                                }
                                if(!repeated){
                                    new_threads.push(trimmed_thread)
                                }
                                
                                break
                            }
                        }
                        break
                    }

                }

            }

            code += chain_rule(multi_path_threads)
            code += chain_rule(new_threads)

            return code
        }

        //multi_path with no inner multi paths
        if(multi_path){
            for(let i = 0; i < threads.length; i++){
                code += chain_rule([threads[i]], i)
            }

            //sum them together
            code += "    float d"+first_element+"d"+last_element+"["+network.tensors[first_element].size +"]["+ network.tensors[last_element].size+"];\n"
            code += "    for(uint32_t i = 0; i < "+network.tensors[first_element]+"; i++){\n"
            code += "        for(uint32_t j = 0; j < "+network.tensors[last_element]+"; j++){\n"
            code += "            d"+first_element+"d"+last_element+"[i][j] = d"+first_element+"d"+last_element+"_path0[i][j];\n" 
            for(let i = 1; i < threads.length; i++){
                code += "            d"+first_element+"d"+last_element+"[i][j] += d"+first_element+"d"+last_element+"_path"+i+"[i][j];\n"
            }
            code += "        }\n"
            code += "    }\n"
            code += "    \n"
            return code
        }

        for(let i = 0; i < threads.length; i++){
            code += chain_rule([threads[i]])
        }


        
        //TODO
        console.log(multi_path)
        console.log(node_pair_table)
        return code
    }


    code += chain_rule(parameter_threads)



    code += "}\n"
    return code
}
