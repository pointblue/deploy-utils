/**
 * Read and write repo lists to repo_inventory_*.json files, the "Inventory"
 * @type {module:fs}
 */
const fs = require('fs');
const home_dir = require('os').homedir();
//TODO: check if file exists first
//use `npm install dotenv` to install dotenv requirement
require('dotenv').config({ path: `${home_dir}/.env` });

/**
 * Read a repo_inventory.json file from the correct filesystem location and return the contents, which should be a list
 * of repos generated from a list command
 *
 * @param inventoryAlias {string} reads a non-default inventory by the alias given
 * @returns {any}
 */
async function getLocalRepoList(inventoryAlias = ''){

    if(inventoryAlias.length > 0) inventoryAlias = '_' + inventoryAlias;

    //the inventory alias is check an additional part of the inventory file name to uniquely identify it
    //TODO: This should check if the file exist and throw and error if it does not
    let raw = fs.readFileSync(`${home_dir}/repo_inventory${inventoryAlias}.json`, 'utf8');
    return JSON.parse(raw);
}

async function updateLocalRepoList(newRepos, inventoryAlias = ''){
    //write array to a file in the user's home directory
    let data = JSON.stringify(newRepos);
    //TODO: Make sure the file exists
    fs.writeFileSync(`${home_dir}/repo_inventory${inventoryAlias}.json`, data);

    return {
        recordsFetched:newRepos.length
    };
}

let Inventory = {};

Inventory.getLocalRepoList = getLocalRepoList;
Inventory.updateLocalRepoList = updateLocalRepoList;

module.exports = Inventory;