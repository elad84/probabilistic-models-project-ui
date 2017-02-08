import {AjaxUtil} from '../utils/AjaxUtils';
let vis = require('vis');

AjaxUtil.getData('POST', 'http://localhost:8080/bayesian/network',
    {"filePath" : "/Users/eladcohen/IdeaProjects/probabilistic-model/src/main/resources/networks/workday.json"},
    function(networkNodes){
        var nodes = new vis.DataSet({});
        var edges = new vis.DataSet({});

        let node;

        for(let i = 0; i < networkNodes.length; i++){
            node = networkNodes[i];

            nodes.add([{
                id : node.nodeId,
                label : node.displayName
            }]);

            if(node.dependencyList && node.dependencyList.length > 0){
                for(let j = 0; j < node.dependencyList.length; j++){
                    edges.add([{
                        from : node.dependencyList[j],
                        to: node.nodeId,
                        arrows : 'to'
                    }]);
                }
            }
        }

        var ids = nodes.getIds();

        // create a network
        var container = document.getElementById('mynetwork');
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {};
        var network = new vis.Network(container, data, options);
    });

