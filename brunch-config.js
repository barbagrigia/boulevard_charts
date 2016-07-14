module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'app.js': /^app/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  paths: {
    public: './lib/boulevard_charts/templates'
  },

  plugins: {
    babel: {presets: ['es2015']}
  }
};
