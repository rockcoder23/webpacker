module.exports = {
    entry: '',  //your entry file
    output: {
        path: '',  //your output path
        filename: '[name]-bundle.js',
        sourceMapFilename: '[file].map?'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                cacheDirectory: true
            }

        }]
    },
    devtool: '#source-map', 
    bundleName: 'main-bundle.js'  //your bundle name
}