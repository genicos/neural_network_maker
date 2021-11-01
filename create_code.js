function create_code(network){

    network.expand()

    var code = ""
    code += "#include <float.h>\n"
    code += "#include <inttypes.h>\n\n"

    



    //First, we determine an order of operators that causes no dependency hazards
    var ordered_operators = []
    var computed_tensors = [...network.input_tensors]


    while(computed_tensors.length != 0){
        var no_computation = true

        console.log("ORDERED OPERATORS\n");
        console.log(ordered_operators)
        console.log("COMPUTED TENSORS\n")
        console.log(computed_tensors)

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

                    console.log("calculating operator " + i)
                    out_forms = function_table[network.operators[i].func].calc_form(network.operators[i].inputs, network)
                    console.log("out_forms " + out_forms)
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

        //convolution, this one will be difficult
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
            code += "        float temp"+ordered_operators[i]+" = t"+this_op.inputs[0]+"[i] - t"+this_op.inputs[1]+";\n"
            code += "        t"+this_op.outputs[0]+treatment+" += temp"+ordered_operators[i]+" * temp"+ordered_operators[i]+";\n"
            code += "    }\n"
        }


    }
    code += "}\n"
    return code
}