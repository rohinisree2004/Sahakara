// Register all Mongoose models
const fs = require('fs');
const path = require('path');

const models = {};

fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js' && file.endsWith('.js')) {
    const modelName = file.replace('.js', '');
    try {
      models[modelName] = require(path.join(__dirname, file));
    } catch (err) {
      console.warn(`[Model Init] Failed to load model ${file}:`, err.message);
    }
  }
});

module.exports = models;
