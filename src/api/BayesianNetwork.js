// import {AjaxUtil} from '../utils/AjaxUtils';
let AjaxUtil = require('../utils/AjaxUtils').AjaxUtil;
// import vis from 'vis';
let vis = require('vis');
var $ = require( 'jquery' );
var dt = require( 'datatables' )( window, $ );
// import dt from 'datatables.net';
// import 'datatables.net-dt/css/jquery.dataTables.css'

const tableNodes = {},
    nodeTablePrefix = "networkNode";

function createTables(columns, tableData, tableId, tableName, display) {
    var tableHeaders = "";
    let columnData =[];
    //create table header
    $.each(columns, function(i, val){
       tableHeaders += "<th>" + val + "</th>";
        columnData.push({ data : val});
    });

    if(!display){
        let nodeTableId = nodeTablePrefix + tableId;
        $("#tableDiv").append('<div id="' + nodeTableId +  '" class="tableNode" style="display:none"/>');
        $("#" + nodeTableId).append('<div>' + tableName + '</div>');
        $("#" + nodeTableId).append('<table id="displayTable' + tableId + '" class="display cell-border" cellspacing="0" width="100%">' +
            '<thead><tr>' + tableHeaders + '</tr></thead>' +
            '</table>');
    }else{
        $('#binaryMatrix').append('<table id="displayTable' + tableId + '" class="display cell-border" cellspacing="0" width="100%">' +
            '<thead><tr>' + tableHeaders + '</tr></thead>' +
            '</table>');
    }

    let newTable = $('#displayTable'+tableId).DataTable({
        "bPaginate": false,
        "columns.data" : columnData,
        "searching" : false
    });

    //add all the rows to the table
    for(let i = 0; i < tableData.length; i++){
        newTable.row.add(tableData[i]);
    }

    tableNodes[tableId] = newTable;
    newTable.draw(false);

}


$(document).ready(function() {
    getExample();
});

function getExample(){
    AjaxUtil.getData('POST', 'http://localhost:8080/bayesian/network',
        {"filePath" : "/Users/eladcohen/IdeaProjects/probabilistic-model/src/main/resources/networks/workday.json"},
        function(networkNodes){
            var nodes = new vis.DataSet({});
            var edges = new vis.DataSet({});
            let columns, nodeMapping = {},
                binaryMatrixColumns = [''],
                binaryMatrixRows = [],
                binaryMatrixMap = {};

            let node;

            for(let i = 0; i < networkNodes.length; i++){
                node = networkNodes[i];
                nodeMapping[node.nodeId] = node.displayName;

                //add to membership matrix
                binaryMatrixColumns.push('&Psi;' + node.nodeId);

                let binaryMatrixRow = Array.apply(null, Array(networkNodes.length+1)).map(Number.prototype.valueOf,0);
                //add display name as first column
                binaryMatrixRow[0] = node.displayName;
                binaryMatrixRow[node.nodeId] = 1;
                binaryMatrixMap[node.nodeId] = binaryMatrixRow;
            }

            for(let i = 0; i < networkNodes.length; i++){
                node = networkNodes[i];
                columns = [];
                columns.push(node.displayName);

                nodes.add([{
                    id : node.nodeId,
                    label : node.displayName
                }]);

                if(node.parentList && node.parentList.length > 0){
                    for(let j = 0; j < node.parentList.length; j++){

                        edges.add([{
                            from : node.parentList[j],
                            to: node.nodeId,
                            arrows : 'to'
                        }]);

                        binaryMatrixMap[node.parentList[j]][node.nodeId] = 1;

                        //add column for parent
                        columns.push(nodeMapping[node.parentList[j]]);
                    }
                }

                columns.push("probability");

                let conditionalTable = node.conditionalTable;
                let tableData = [], nodeValue, row;

                for(let i = 0; i < conditionalTable.length; i++){
                    nodeValue = conditionalTable[i];

                    if(nodeValue.dependency){
                        for(let j = 0; j < nodeValue.dependency.length; j++){
                            row = [];
                            row.push(nodeValue.nodeValue);
                            let nodeValueDepedency = nodeValue.dependency[j];
                            for(let k=0; k< nodeValueDepedency.dependencyNodes.length; k++){
                                row.push(nodeValueDepedency.dependencyNodes[k].value);
                            }
                            row.push(nodeValueDepedency.probability);
                            tableData.push(row);
                        }
                    }else {
                        row = [];
                        row.push(nodeValue.nodeValue);
                        row.push(nodeValue.probability);
                        tableData.push(row);
                    }
                }
                createTables(columns, tableData, node.nodeId, node.displayName, false);
            }

            for(let row in binaryMatrixMap){
                if(binaryMatrixMap.hasOwnProperty(row)){
                    binaryMatrixRows.push(binaryMatrixMap[row]);
                }
            }

            createTables(binaryMatrixColumns, binaryMatrixRows, 'BinaryMatrix', null, true);

            var ids = nodes.getIds();

            // create a network
            var container = document.getElementById('mynetwork');
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {};
            var network = new vis.Network(container, data, options);
            network.on('click', properties => {
                $('.tableNode').hide();
                for(let i = 0; i < properties.nodes.length; i++){
                    $("#" + nodeTablePrefix + properties.nodes[i]).show();
                }
            });
        });
}



