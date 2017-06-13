import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Graph from 'react-graph-vis'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AjaxUtil from "../utils/AjaxUtil"

let options = {
	width : '100%',
	layout: {
		hierarchical: false
	},
	edges: {
		color: "#000000"
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
	margin: 12,
};

let graph = {
	nodes: [
		{id: 1, label: 'Node 1', color: '#e04141'},
		// {id: 2, label: 'Node 2', color: '#e09c41'},
		// {id: 3, label: 'Node 3', color: '#e0df41'},
		// {id: 4, label: 'Node 4', color: '#7be041'},
		// {id: 5, label: 'Node 5', color: '#41e0c9'}
	]
};

/**
 * The input is used to create the `dataSource`, so the input always matches three entries.
 */
export default class NodeInput extends Component {
	state = {
		nodes : [],
		nodesMap : {},
		value: '',
		graph : {
			nodes : [],
			edges : []
		},
		chosenNode : null,
		chosenNodes : []
	};

	handleNodeChosen = (params) => {
        this.setState({
			chosenNode : params.nodes[0]
		});
	}

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
                edges: edges.concat({from: this.state.chosenNode, to: values[values.length-1]})
            }
        });
	};

	addNode = (e) => {
		let name = this.refs.nodeNameField.input.value;
		console.log("add node from ref " + name);

		const { graph } = this.state;
		const nodes = Array.from(graph.nodes);

		this.setState({
			graph: {
				graph,
				nodes: nodes.concat({id: name, label: name, color: '#41e0c9'}),
				edges: graph.edges
			}
		});

		this.setState((prev,props) => {
			return {
				"nodes": prev.nodes.concat({"name": name})
			}
		})
	};

	createBaseNetwork = (e) => {
		const { graph } = this.state;
		// const nodes = Array.from(graph.nodes);

		const nodes = [];

		let count = this.refs.nodeCount.input.value;
		count++;

		for(let i =1; i < count; i++) {
			nodes.push({id: i, label: 'Node'+ i, color: '#41e0c9'})
		}

		this.setState({
			graph: {
				graph,
				nodes: nodes,
				edges: graph.edges
			}
		});

		const nodesMapping = {};
		nodes.map((node)=> {
			nodesMapping[node.id] = node;
		});

		this.setState((prev,props) => {
			return {
				"nodes": nodes
			}
		 });

		this.setState({
            nodesMap : nodesMapping
		});
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

	saveNetwork = () => {
		let name = this.refs.networkNameField.input.value;
		const {nodes, edges} = this.state.graph;
		const networkNodes = [], networkEdges = [], nodeMap = {};

		for(let i = 0; i < nodes.length; i++){
			networkNodes.push({"nodeId" : nodes[i].id, "displayName" : nodes[i].label, "parentList" : nodes[i]["parents"]});
		}

		for(let i = 0; i < edges.length; i++){
			networkEdges.push({"nodeId1" : edges[i].from, "nodeId2" : edges[i].to, "nodeArrowHead": edges[i].from});
			console.log(JSON.stringify(edges[i]));
		}

		let bayesian = {
			"networkName" : name,
			"nodes" : networkNodes,
			"edges" :networkEdges
		}

		console.log(JSON.stringify(bayesian));
		AjaxUtil.postData('http://localhost:8080/bayesian/network/create', bayesian);
	}


	render() {
		const children = [],
			parentsList = [];

		parentsList.push(<MenuItem key="null1" value={null} primaryText=""/>)
		// edgeNodes2.push(<MenuItem key="null2" value={null} primaryText=""/>)
		for (var i = 0; i < this.state.nodes.length; i++) {
			// children.push(<NodeNameField key={this.state.nodes[i].name} val={this.state.nodes[i].name} />);
			parentsList.push(<MenuItem key={this.state.nodes[i].id} value={this.state.nodes[i].id} primaryText={this.state.nodes[i].label}  insetChildren={true} checked={this.state.chosenNodes && this.state.chosenNodes.indexOf(this.state.nodes.id) > -1}/>)
		};

		return (
			<div>
				<div className="network-control">
					<RaisedButton label="Save Network" style={style} onTouchTap={this.saveNetwork} />
					<FlatButton label="Load Network" labelPosition="before">
						<input type="file"/>
					</FlatButton>
				</div>

				<TextField
					hintText="Network Name"
					floatingLabelText="Network Name"
					ref = "networkNameField"
				/>
				<TextField
					hintText="1"
					floatingLabelText="Number of Nodes"
					ref = "nodeCount"
				/>
				<RaisedButton label="Create Network" style={style} onTouchTap={this.createBaseNetwork} />

				<SelectField
					floatingLabelText="Choose Parents"
					id="1"
					value={this.state.chosenNodes}
					multiple={true}
					onChange={this.handleChangeParents}
				>
					{parentsList}
				</SelectField>
				{/*<SelectField*/}
					{/*floatingLabelText="Choose Node"*/}
					{/*value={this.state.edgeNode2}*/}
					{/*id="2"*/}
					{/*onChange={this.handleChange2}*/}
				{/*>*/}
					{/*{edgeNodes2}*/}
				{/*</SelectField>*/}
				{/*<RaisedButton label="Add Edge" style={style} onTouchTap={this.addEdge} />*/}
				<h1>Your Network</h1>
				<Graph graph={this.state.graph} options={options} events={{click: this.handleNodeChosen}} />
			</div>
		);
	}
}
