
class network{
    constructor(){
        this.num_nodes = 0
        this.nodes = []

        this.input_nodes = []
        this.param_nodes = []
        this.output_nodes = []
        this.transient_nodes = []

        this.x = 0;
        this.y = 0;
    }
}

class node{
    constructor(){
        this.parent_1 = 0;
        this.parent_2 = 0;

        this.num_children = 0;
        this.children = []

        this.function = 0;
        this.x = 0;
        this.y = 0;
    }
}