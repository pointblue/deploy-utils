/**
 * index.js
 *
 * build the main pdep object that will be exported from this file
 */


let pdep = {};

pdep.RepoList = require('./src/RepoList.js');
pdep.DeployTask = require('./src/DeployTask.js');

module.exports = pdep;