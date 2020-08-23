/**
 * Reusable functions for getting a list of repos from the repo_inventory_*.json files
 * @type {module:fs}
 */

const Inventory = require('./Inventory');
const OrgRepos = require('./OrgRepos');
const home_dir = require('os').homedir();
//TODO: check if file exists first
//use `npm install dotenv` to install dotenv requirement
require('dotenv').config({ path: `${home_dir}/.env` });



async function updateFromRemote(topics, alias){

    //get the repos for this org and only keep the ones matching our topic
    return OrgRepos.getReposByTopic(topics)
        .then((filteredRepos)=>{

            //take the list of repose and save it locally
            return Inventory.updateLocalRepoList(filteredRepos, alias);

        })
    ;
}

let RepoList = {};

RepoList.getLocalRepoList = Inventory.getLocalRepoList;
RepoList.updateFromRemote = updateFromRemote;

module.exports = RepoList;