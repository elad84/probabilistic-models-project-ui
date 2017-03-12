/**
 * Created by eladcohen on 22/12/2016.
 */
const debug = process.env.NODE_ENV !== 'production';
const webpack = require('webpack');
const path = require('path');

var src = path.resolve("./");

console.log(src);

var config ={
    //context : __dirname + '/src',
    entry: './src/api/BayesianNetwork.js',
    output : {
        path : "./public",
        filename : "models-sdk.min.js"
    },
    devtools : debug ? "inline-sourcemap" : null,
    module : {
        loaders: [
            {
                include: this.context,
                test : /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /\.js$/,
                loader: 'imports?define=>false'
            }
            // {
            //     test: /\.css$/,
            //     loader: "style!css"
            // }
        ]
    },
    plugins : debug ? [] : [
            new webpack.optimize.DedupePlugin(),
            // new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin()
        ]
};


module.exports = config;
