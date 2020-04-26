
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'js')
  },
  module: {
    rules: [
      {
        test : /\.html$/,
        use  : 'raw-loader'
      }
    ]
  },

  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // Use the full build
    }
  },

};
