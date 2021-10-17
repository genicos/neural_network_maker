example_net = new Network()
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())
example_net.add_tensor(new Tensor())

example_net.output_tensors.push(0)
example_net.tensors[0].function = function_table[5];
example_net.tensors[0].parent_1 = 1
example_net.param_tensors.push(1)

example_net.tensors[1].function = function_table[3]
example_net.tensors[1].parent_1 = 2;
example_net.tensors[1].parent_2 = 3;
example_net.param_tensors.push(2)

example_net.tensors[3].function = function_table[3]
example_net.tensors[3].parent_1 = 4;
example_net.tensors[3].parent_2 = 5;
example_net.param_tensors.push(4)

example_net.tensors[5].function = function_table[8]
example_net.tensors[5].parent_1 = 6;
example_net.tensors[5].parent_2 = 7;
example_net.param_tensors.push(6)

example_net.tensors[7].function = function_table[8]
example_net.tensors[7].parent_1 = 8;
example_net.tensors[7].parent_2 = 9;
example_net.param_tensors.push(8)
example_net.input_tensors.push(9)



console.log(example_net.tensors[7].function.name)
console.log("fuck")