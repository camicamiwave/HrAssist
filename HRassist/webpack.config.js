const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/server.js', 
        auth: './src/auth.js', 
        cloud_storage: './src/cloud.js', 
        firestore_storage: './src/firestore.js',
        firestore_add: './src/add_firestore.js',
        firestore_retrieve: './src/retrieve_firestore.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/bundles'),
        filename: '[name].bundle.js',
    },
    watch: true,
};
