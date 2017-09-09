import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Graph from 'react-graph-vis'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AjaxUtil from "../utils/AjaxUtil"
import MyTable from './DepedencyTAble'
// import Popup from 'react-popup';
import Dialog from 'material-ui/Dialog';
import NetworkTypeSelect from '../create/NetworkTypeSelect'

let options = {
	width : '100%',
	layout: {
        improvedLayout: true
	},
	edges: {
		color: "#000000"
	},
    manipulation : {
        addNode: function(nodeData, callback){
            nodeData.label = 'Control Node';
            callback(nodeData);
		}
	}
};

let events = {
	select: function(event) {
		var { nodes, edges } = event;
		console.log("Selected nodes:");
		console.log(nodes);
		console.log("Selected edges:");
		console.log(edges);
	}
}

const style = {
	margin: 12
};

let graph = {
	nodes: [
	]
};

/**
 * The input is used to create the `dataSource`, so the input always matches three entries.
 */
export default class NodeInput extends Component {
	state = {
        networkName : "Network Name",
		networkType : null,
		nodes : [],
		nodesMap : {},
		value: '',
		graph : {
			nodes : [],
			edges : []
		},
		chosenNode : null,
		chosenNodes : [],
		open : false,
		nodeValues : null,
        networkDialogOpen : false,
		saveNetworkStyle : {
            margin: 12,
            display: "none"
		},
		addNodeStyle : {
            margin: 12,
            display: "none"
		},
		addControlButtonStyle : {
            margin: 12,
            display: "none"
		}
	};

	handleNodeChosen = (params) => {
		this.setState({
            chosenNodes : []
		});
        this.setState({
			chosenNode : params.nodes[0]
		});
        let domain = this.state.nodesMap[params.nodes[0]]['domain'];
        if(domain){
            this.setState({
                nodeValues :  domain.value ? domain.value : domain.name
            });
		}

        // this.refs.dialogWithCallBacks.show();
        this.handleOpen();
	};

	handleChangeParents = (event, index, values) => {
		this.state.nodesMap[this.state.chosenNode]['parents'] = values;
		this.setState({
			chosenNodes : values
		});

        const { graph } = this.state;
        const edges = Array.from(graph.edges);

        this.setState({
            graph: {
                graph,
                nodes : graph.nodes,
                edges: edges.concat({from: values[values.length-1], to: this.state.chosenNode})
            }
        });
	};

	addNode = (e) => {
		const { graph } = this.state;

		let graphNodes = Array.from(graph.nodes), nodes = Array.from(this.state.nodes);
		if(nodes.length == 0){
			alert("Cannot add node to an empty network");
			return;
		}

		let id = 1;
		for(let i =0; i < nodes.length; i++){
			if(id < nodes[i].id){
				id = nodes[i].id;
			}
		}

		id++;

        let node = {id: id, label: 'Node'+ id, color: '#41e0c9'};
        graphNodes = graphNodes.concat(node);
        nodes = nodes.concat(node)

        if(this.state.networkType == 2){
            graphNodes.push({id: id+nodes.length, label: 'Node'+ id + "(i-1)", color: '#175ed1'});
		}


		this.setState({
			graph: {
				graph,
				nodes: graphNodes,
				edges: graph.edges
			}
		});

		this.state.nodesMap[id] = node;

		this.setState({
            "nodes": nodes
		})
	};

    addControlNode = () => {
        const { graph } = this.state;
        const graphNodes = Array.from(graph.nodes);
        const nodes = Array.from(this.state.nodes);

        if(nodes.length == 0){
            alert("Cannot add control node to an empty network");
            return;
        }

        let id = 'c0';
        for(let i =0; i < nodes.length; i++){
            if(nodes[i].control == true && id < parseInt(nodes[i].id.substring(1), 10)){
                id = nodes[i].id;
            }
        }

        let intId = parseInt(id.substring(1), 10);
		intId++;

		let newNodeId = 'c' + intId;

        let node = {id: newNodeId, label: 'Control Node'+ intId, color: '#6aa34e', control: true};


        this.setState({
            graph: {
                graph,
                nodes: graphNodes.concat(node),
                edges: graph.edges
            }
        });

        this.state.nodesMap[newNodeId] = node;

        this.setState({
            nodes: nodes.concat(node)
        });
    }

	createBaseNetwork = (e) => {
		const { graph } = this.state;

		this.setState({
			networkType : this.networkTypeSelect.state.value
		});

		const nodes = [];

		let count = this.refs.nodeCount.input.value;
		count++;

		for(let i =1; i < count; i++) {
			nodes.push({id: i, label: 'Node'+ i, color: '#41e0c9'})
		}

		let networkNodes = nodes.slice();

		if(this.networkTypeSelect.state.value === 2){
            for(let i =1; i < count; i++) {
                networkNodes.push({id: i+count, label: 'Node'+ i + "(i-1)", color: '#175ed1', original : false});
            }

            this.setState({
                addControlButtonStyle: {
                    margin: 12,
                    display : "inline-block"
                }
            });
		}

		this.setState({
			graph: {
				graph,
				nodes: networkNodes,
				edges: graph.edges
			}
		});

		const nodesMapping = {};
		nodes.map((node) => {
			nodesMapping[node.id] = node;
		});

		this.setState({
            "nodes": nodes
    		});

		this.setState({
            nodesMap : nodesMapping
		});

        this.setState({
			networkName : this.refs.networkNameField.input.value
        });

        this.setState({
            saveNetworkStyle: {
                margin: 12,
                display : "inline-block"
            }
        });

        this.setState({
            addNodeStyle: {
                margin: 12,
                display : "inline-block"
            }
        });

		this.handleNetworkDialogClose();
	};

	addEdge = (e) => {
		const { graph } = this.state;
		const edges = Array.from(graph.edges);

		this.setState({
			graph: {
				graph,
				nodes : graph.nodes,
				edges: edges.concat({from: this.state.edgeNode1, to: this.state.edgeNode2})
			}
		});
	};

	saveNetwork = (e) => {

		let name = this.state.networkName;
		const {edges} = this.state.graph, nodes = this.state.nodes;
		const networkNodes = [], networkEdges = [], nodeMap = {};

		for(let i = 0; i < nodes.length; i++){
			networkNodes.push({"nodeId" : nodes[i].id, "displayName" : nodes[i].label, "parentList" : nodes[i]["parents"],
				"domain" : this.state.nodesMap[nodes[i].id] && this.state.nodesMap[nodes[i].id].domain ? this.state.nodesMap[nodes[i].id].domain : null});

			if(nodes[i].control === true){
				networkNodes[i].controlNode =true;
			}
		}

		for(let i = 0; i < edges.length; i++){
			networkEdges.push({"nodeId1" : edges[i].from, "nodeId2" : edges[i].to, "nodeArrowHead": edges[i].from});
		}

		let bayesian = {
		    "filePath" : e.target.files[0].name,
            "network" : {
                "name" : name,
                "nodes" : networkNodes,
                "edges" :networkEdges
            }
		}

		AjaxUtil.postData('http://localhost:8090/bayesian/network/create', bayesian);
	}

    fileChosen(e){
		console.log(e.target.files[0].name);
		const _this = this;
		AjaxUtil.getData("GET", "http://localhost:8090/bayesian/network/load?name=" + e.target.files[0].name, void 0, (data)=>{
			_this.setState({
				value: data.name
			});

			const nodes = [], edges =[];
			for(let i = 0; i < data.nodes.length; i++){
				let nodeColor = '#41e0c9', node = data.nodes[i];
				if(data.nodes[i].controlNode === true){
					nodeColor = '#6aa34e';
				}
				nodes.push({id : node.nodeId, label : node['displayName'], color: nodeColor, domain :node.domain});
                this.state.nodesMap[nodes[i]] = nodes[i];
			}

			for(let i = 0; i < data.edges.length; i++){
				edges.push({from : data.edges[i]['nodeId1'], to :data.edges[i]['nodeId2']});
			}

			_this.setState({
                graph: {
                    nodes: nodes,
                    edges: edges
                }
			});

			_this.setState({
				nodes : nodes
			});
		});
	}


    handleOpen = () => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    handleNetworkDialogOpen = () => {
        this.setState({
            networkDialogOpen : true
        });
	};

    handleNetworkDialogClose = () => {
    this.setState({
			networkDialogOpen : false
		});
	};

    setNodeDetails = () => {
        let range = this.refs.nodeDomain.input.value.split(","), domain = [],
		nodeLabel = this.refs.nodeLabel.input.value;
        let rangeStr = this.refs.nodeDomain.input.value;

        //set node label
		if(nodeLabel && nodeLabel !== ''){
            const { graph } = this.state;
            const nodes = Array.from(graph.nodes);

            let node = null, index;
            for(let i =0; i < nodes.length; i++){
                if(this.state.chosenNode === nodes[i].id){
                    node = nodes[i];
                    index = i;
                }
            }

            if(node !== null){
            	let copy = Object.assign({}, node);
            	copy.label = nodeLabel;
            	nodes.splice(index, 1);
            	nodes.push(copy);
			}

            this.setState({
                graph: {
                    graph,
                    nodes: nodes,
                    edges: graph.edges
                }
            });

            this.setState({
                "nodes": nodes
            });
            this.state.nodesMap[this.state.chosenNode]['label'] = nodeLabel;
		}

        //set node range
        if(rangeStr.indexOf(',') > 0){
        	//have range as label
        	range = rangeStr.split(",");
            for(let i = 0; i < range.length-1; i++){
                domain.push({"name" : range[i]});
            }
            //set the value for all names starting at zero
            for(let i = 0; i < domain.length; i++){
                domain[i].value = i;
            }
		}else{
			range = rangeStr.split('-');
            //set the lower value to the first value
            let lower = parseInt(range[0], 10);
            if(domain[0] === undefined){
                domain[0] = {'value' : lower};
            }else{
                domain[0].value = lower;
            }

            if(range.length > 1){
                //iterate until higher bound and set all values
                for(let i = lower+ 1, j =1; i < parseInt(range[1], 10); i++, j++){
                    if(domain[j] === undefined){
                        domain[j] = {'value' : i};
                    }else{
                        domain[j].value = i;
                    }
                }
            }
		}

        this.state.nodesMap[this.state.chosenNode]['domain'] = domain;
        this.handleClose();
	};

	render() {
		{/*Buttons for Node settings dialog*/}
        const actions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onTouchTap={this.handleClose}
			/>,
			<FlatButton
				label="Set Node Details"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.setNodeDetails}
			/>
        ];

		{/*Buttons for create dialog */}
        const createDialogActions = [
			<FlatButton
				label="Cancel"
				primary={true}
				onTouchTap={this.handleNetworkDialogClose}
			/>,
			<FlatButton
				label="Create"
				primary={true}
				keyboardFocused={true}
				onTouchTap={this.createBaseNetwork}
			/>
		];


		const children = [],
			parentsList = [];
		let nodes = this.state.nodes;

		if(this.state.networkType === 2){
			nodes = this.state.graph.nodes;
		}

		parentsList.push(<MenuItem key="null1" value={null} primaryText=""/>);
		for (let i = 0; i < nodes.length; i++) {
			parentsList.push(<MenuItem key={nodes[i].id} value={nodes[i].id} primaryText={nodes[i].label}  insetChildren={true} checked={this.state.chosenNodes && this.state.chosenNodes.indexOf(this.state.nodes.id) > -1}/>)
		}

		return (
			<div>
				<div className="network-control">
					<FlatButton label="Load Network" containerElement='label' labelPosition="before">
						<input type="file" onChange={this.fileChosen.bind(this)}/>
					</FlatButton>
					<RaisedButton label="Create New Network" style={style} onTouchTap={this.handleNetworkDialogOpen} />
				</div>

				<Dialog
					title="Network Details"
					actions={createDialogActions}
					modal={false}
					open={this.state.networkDialogOpen}
					onRequestClose={this.handleNetworkDialogClose}
				>
					<NetworkTypeSelect ref={(networkTypeSelect) => {this.networkTypeSelect = networkTypeSelect;}}/>
					<TextField
						hintText="Network Name"
						floatingLabelText="Network Name"
						// value = {this.state.value}
						ref = "networkNameField"
					/>
					<TextField
						hintText="1"
						floatingLabelText="Number of Nodes"
						ref = "nodeCount"
					/>
				</Dialog>


				{/*<SelectField*/}
					{/*floatingLabelText="Choose Node"*/}
					{/*value={this.state.edgeNode2}*/}
					{/*id="2"*/}
					{/*onChange={this.handleChange2}*/}
				{/*>*/}
					{/*{edgeNodes2}*/}
				{/*</SelectField>*/}
				{/*<RaisedButton label="Add Edge" style={style} onTouchTap={this.addEdge} />*/}
				<h1>{this.state.networkName}</h1>
                {/*<RaisedButton label="Save Network" style={this.state.saveNetworkStyle} onTouchTap={this.saveNetwork} />*/}
                <RaisedButton label="Add New Node" style={this.state.addNodeStyle} onTouchTap={this.addNode} />
				<RaisedButton label="Add Control Node" style={this.state.addControlButtonStyle} onTouchTap={this.addControlNode} />
                <FlatButton label="Save Network" containerElement='label' labelPosition="before" labelStyle={this.state.saveNetworkStyle}>
                    <input type="file" style={this.state.saveNetworkStyle} onChange={this.saveNetwork.bind(this)}/>
                </FlatButton>
				<Graph graph={this.state.graph} options={options} events={{click: this.handleNodeChosen}} />

				{/*Dialog to set node details*/}
				<Dialog
					title="Node details"
					actions={actions}
					modal={false}
					open={this.state.open}
					onRequestClose={this.handleClose}
					>
					<div>
						<TextField
							hintText="0-1 or Name1, Name2..."
							value= {this.state.nodeValues}
							floatingLabelText="Domain"
							ref = "nodeDomain"
						/>
					</div>
					<div>
						<TextField
							hintText="Node 1"
							// value= {this.state.chosenNode && this.state.chosenNode.label || ""}
							floatingLabelText="Label"
							ref = "nodeLabel"
						/>
					</div>
					<div>
						<SelectField
							floatingLabelText="Choose Parents"
							id="1"
							value={this.state.chosenNodes}
							multiple={true}
							onChange={this.handleChangeParents}
							>
							{parentsList}
						</SelectField>
					</div>
				</Dialog>

				{/*end dialog for node details*/}
			</div>
		);
	}
}
