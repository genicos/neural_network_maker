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

example_net.add_operator(new Operator())
example_net.add_operator(new Operator())
example_net.add_operator(new Operator())
example_net.add_operator(new Operator())
example_net.add_operator(new Operator())

example_net.operators[0].func = 7
example_net.operators[0].outputs.push(0)
example_net.operators[0].inputs.push(1)

example_net.operators[1].func = 5
example_net.operators[1].outputs.push(2)
example_net.operators[1].inputs.push(3)

example_net.operators[2].func = 5
example_net.operators[2].outputs.push(4)
example_net.operators[2].inputs.push(5)

example_net.operators[3].func = 10
example_net.operators[3].outputs.push(6)
example_net.operators[3].inputs.push(7)

example_net.operators[4].func = 10
example_net.operators[4].outputs.push(8)
example_net.operators[4].inputs.push(9)



console.log(example_net.tensors[7].function.name)
console.log("fuck")