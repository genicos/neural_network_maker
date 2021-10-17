example_net = new Network()
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())
example_net.addNode(new Node())

example_net.output_nodes.push(0)
example_net.nodes[0].function = function_table[5];
example_net.nodes[0].parent_1 = 1
example_net.param_nodes.push(1)

example_net.nodes[1].function = function_table[3]
example_net.nodes[1].parent_1 = 2;
example_net.nodes[1].parent_2 = 3;
example_net.param_nodes.push(2)

example_net.nodes[3].function = function_table[3]
example_net.nodes[3].parent_1 = 4;
example_net.nodes[3].parent_2 = 5;
example_net.param_nodes.push(4)

example_net.nodes[5].function = function_table[8]
example_net.nodes[5].parent_1 = 6;
example_net.nodes[5].parent_2 = 7;
example_net.param_nodes.push(6)

example_net.nodes[7].function = function_table[8]
example_net.nodes[7].parent_1 = 8;
example_net.nodes[7].parent_2 = 9;
example_net.param_nodes.push(8)
example_net.input_nodes.push(9)



console.log(example_net.nodes[7].function.name)
console.log("fuck")