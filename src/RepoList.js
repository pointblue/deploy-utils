/**
 * Reusable functions for getting a list of repos from the repo_inventory_*.json files
 * @type {module:fs}
 */

const {Octokit} = require("@octokit/rest");
const fs = require('fs');
const { execSync } = require('child_process');
const home_dir = require('os').homedir();
//TODO: check if file exists first
//use `npm install dotenv` to install dotenv requirement
require('dotenv').config({ path: `${home_dir}/.env` });

const OWNER = 'pointblue';

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


const octokit = new Octokit({
    auth: process.env.GIT_TOKEN
});

async function fetchAndWriteOutRepoData(topics, alias){
    if(alias.length > 0) alias = '_' + alias;
    return getOrgReposWithTopics(topics)
        .then((filteredRepos)=>{
            //write array to a file in the user's home directory
            let data = JSON.stringify(filteredRepos);
            //TODO: Make sure the file exists
            fs.writeFileSync(`${home_dir}/repo_inventory${alias}.json`, data);

            return {
                recordsFetched:filteredRepos.length
            };
        })
        ;
}

function getOrgReposWithTopics(topics){
    return getOrgRepos()
        .then(addTopicsToRepos)
        .then((reposWithTopics)=>{
            return filterReposByAllTopics(reposWithTopics, topics);
        })
        ;
}



/**
 * Add topics directly to repo object
 * @param repos
 * @returns {Promise<unknown[]>}
 */
function addTopicsToRepos(repos){
    let promises = [];
    for(let repo of repos) {
        let promise = getRepoTopics(OWNER, repo.name).then(({names}) => {
            repo.topics = names;
        });
        promises.push(promise);
    }
    return Promise.all(promises).then(()=>{
        return repos;
    });
}

function getOrgRepos(){
    //TODO: maxPages should be calculated as total_repos/per_page. we need to know total_repos
    let maxPages = 2;
    let promises = [];
    for(let i=0;i<maxPages;i++) {
        let promise = octokit.repos
            .listForOrg({
                org: OWNER,
                type: "all",
                per_page: 100,
                page: i+1,
                sort: "full_name",
                affiliation: "collaborator"
            }).then(({data}) =>{
                //parse out just the data property of the response
                return data;
            });

        promises.push(promise);

    }
    return Promise.all(promises).then((allData)=>{
        //take each array that is in allData, concat them together, and return that array
        return [].concat(...allData);
    });
}

function getRepoTopics(owner, repo) {
    return octokit.request("GET /repos/:owner/:repo/topics", {
        owner,
        repo,
        headers: {
            Accept: 'application/vnd.github.mercy-preview+json'
        }
    }).then(({data})=>{
        return data;
    });
}

function filterReposByAllTopics(repos, topics){
    let matchedRepos = [];
    for(let repo of repos){
        let match = topics.every(value => { return repo.topics.includes(value)});
        if(match){
            matchedRepos.push(repo);
        }
    }
    return matchedRepos;
}

let RepoList = {};

RepoList.getLocalRepoList = getLocalRepoList;
RepoList.updateFromRemote = fetchAndWriteOutRepoData;

module.exports = RepoList;