
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'js')
  },
  module: {
    rules: [
      {
        test : /\.vue$/,
        use  : 'raw-loader'
        // use : 'vue-loader'
      }
    ]
  },

  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // Use the full build
    }
  },

};
