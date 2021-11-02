

var classifyer = new Network()

classifyer.add_tensor(new Tensor(true))
classifyer.add_tensor(new Tensor(true))
classifyer.add_tensor(new Tensor(true))
classifyer.add_tensor(new Tensor(true))

var op = new Operator(5)
op.inputs = [0,1]
op.outputs = [2]
classifyer.add_operator(op)

op = new Operator(7)
op.inputs = [2]
op.outputs = [3]
classifyer.add_operator(op)

classifyer.input_tensors = [0,1]
classifyer.output_tensors = [3]





var classifyer2 = new Network()

classifyer2.add_tensor(new Tensor(true))
classifyer2.add_tensor(new Tensor(true))
classifyer2.add_tensor(new Tensor(true))
classifyer2.add_tensor(new Tensor(true))
classifyer2.add_tensor(new Tensor(true))

op = new Operator(5)
op.inputs = [0,1]
op.outputs = [2]
classifyer2.add_operator(op)

op = new Operator(0)
op.inputs = [2,3]
op.outputs = [4]
op.network = classifyer  // Previously defined network is an abstraction in this network
classifyer2.add_operator(op)

classifyer2.input_tensors = [0,1,3]
classifyer2.output_tensors = [4]




var conv2 = new Network()

conv2.add_tensor(new Tensor(true))
conv2.add_tensor(new Tensor(true))
conv2.add_tensor(new Tensor(true))
conv2.add_tensor(new Tensor(true))
conv2.add_tensor(new Tensor(true))

op = new Operator(10)
op.inputs = [0,1]
op.outputs = [2]
conv2.add_operator(op)

op = new Operator(10)
op.inputs = [2,3]
op.outputs = [4] 
conv2.add_operator(op)

conv2.input_tensors = [0,1,3]
conv2.output_tensors = [4]





var conv2classifyer2 = new Network()

conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))
conv2classifyer2.add_tensor(new Tensor(true))

op = new Operator(0)
op.inputs = [0,1,2]
op.outputs = [3]
op.network = conv2
conv2classifyer2.add_operator(op)

op = new Operator(0)
op.inputs = [3,4,5]
op.outputs = [6]
op.network = classifyer2
conv2classifyer2.add_operator(op)

conv2classifyer2.input_tensors = [0]
conv2classifyer2.param_tensors = [1,2,4,5]
conv2classifyer2.output_tensors = [6]




conv2classifyer2.expand()













//CREATE CODE TEST

var fulladder = new Network()


var shared_form = [2,2]
fulladder.add_tensor(new Tensor(true,shared_form))
fulladder.add_tensor(new Tensor(true,[16]))
fulladder.add_tensor(new Tensor(true))
fulladder.add_tensor(new Tensor(true,shared_form))
fulladder.add_tensor(new Tensor(true))
fulladder.add_tensor(new Tensor(true))
fulladder.add_tensor(new Tensor(true))



var op = new Operator(5)
op.inputs = [0,1]
op.outputs = [2]
fulladder.add_operator(op)

op = new Operator(2)
op.inputs = [2,3]
op.outputs = [4]
fulladder.add_operator(op)

op = new Operator(8)
op.inputs = [4]
op.outputs = [5]
fulladder.add_operator(op)

op = new Operator(9)
op.inputs = [5]
op.outputs = [6]
fulladder.add_operator(op)

fulladder.input_tensors = [0,1,3]
fulladder.output_tensors = [6]

console.log(fulladder.to_string())

console.log(create_function_code(fulladder))


console.log("\n\nCONV2CLASSIFYER2\n\n")

conv2classifyer2.tensors[0].form = [28,28]
conv2classifyer2.tensors[1].form = [3,3]
conv2classifyer2.tensors[2].form = [3,3]
conv2classifyer2.tensors[4].form = [576,18]
conv2classifyer2.tensors[5].form = [18,10]

console.log(conv2classifyer2.to_string())
console.log(create_function_code(conv2classifyer2))

