function create_code(network){

    network.expand()

    var code = ""

    var ordered_operations = []
    var computed_tensors = network.input_tensors

    while(computed_tensors.length != 0){
        var no_computation = true

        //find operators which can now be computed
        for(let i = 0; i < network.operators.length; i++){

            //only check operators we have not already computed
            if(!ordered_operations.includes(i)){
                var all_inputs_are_computed = true

                //check if all inputs have been computed
                for(let k = 0; k < network.operators[i].inputs.length; k++){
                    if(!computed_tensors.includes(network.operators[i].inputs[k])){
                        all_inputs_are_computed = false
                    }
                }

                //if all inputs have been computed, then operator may be computed
                // and all of the operators outputs can be computed
                if(all_inputs_are_computed){
                    no_computation = false

                    ordered_operations.push(i)
                    for(let k = 0; k < network.operators[i].outputs.length; k++){
                        computed_tensors.push(k)
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
        var size_of_tensor = 1;
        for(let k = 0; k < network.tensors[i].form; k++){
            size_of_tensor *= network.tensors[i].form[k]
        }

        code += "double t"+String(i)+ "["+String(size_of_tensor)+"];"
    }

}