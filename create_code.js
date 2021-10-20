function create_code(network){
    var ordered_operations = []
    set_of_tensors_we_are_checking = network.input_tensors

    while(set_of_tensors_we_are_checking.length != 0){
        this_layer_of_operations = []
        next_set_of_tensors = []

        for(let i = 0; i < set_of_tensors_we_are_checking.length; i++){
            this_layer_of_operations.concat(network.tensors[set_of_tensors_we_are_checking[i]].input_of)
        }

        // I gotta add only those operations who has all tensors accounted for
        //ill make an array called calculated tensors, which gets slowly filled
        ordered_operations.concat(this_layer_of_operations)


    }

}