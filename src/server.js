/**
 * Created by eladcohen on 22/12/2016.
 */
const express = require('express');
const compress = require('compression')
const path = require('path')

const app = express();

app.use(compress());

app.listen(3000, function() {
    console.log('listening on 3000')
});

app.use('/vis', express.static(path.join(__dirname + '/node_modules/vis/dist/')));


app.use(express.static(path.join(__dirname ,'../public')));

