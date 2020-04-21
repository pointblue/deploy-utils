#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require("child_process");
const { spawnSync } = require("child_process");
const home_dir = require('os').homedir();
//TODO: check if file exists first
//use `npm install dotenv` to install dotenv requirement
require('dotenv').config({ path: `${home_dir}/.env` });

let repo_base_dir = process.env.DEPLOY_DIR;

let main_command = 'dep deploy';

let reposToDeploy = readReposFromJson();

let repo_order = [
    'deju2',
    'deju2-renew',
    'deju3',
];

let reposToDeployFirst = [];

//pluck each 'dependency' repo by name
for (let orderedRepo of repo_order){
    //find the ordered repo in the list of all repos
    let index = reposToDeploy.findIndex(repo => repo.name === orderedRepo);
    if(index > -1){
        //add this repo to the list of repos to deploy first
        reposToDeployFirst.push(reposToDeploy[index]);
        //remove this repo from the main list of repos
        reposToDeploy.splice(index, 1);
    }
}

//pass them the deploySync function
deployRepos(reposToDeployFirst, repo_base_dir, false);

//pass the remaining repos to deploy Async
deployRepos(reposToDeploy, repo_base_dir);

function deployRepos(repos, reposBaseDir, isAsync = true){
    for(let repo of repos){
        deployRepo(repo, reposBaseDir, isAsync);
    }

}

function deployRepo(repo, repoBaseDir, isAsync = true){
    let options = {
        cwd: `${repoBaseDir}/${repo.name}`
    };

    if(isAsync){
        options.detached = true;
        //TODO: Add error out
        options.stdio = 'ignore';
    }

    let depSpawn = isAsync ?
        spawn('dep', ['deploy', `${process.env.DEPLOY_DEFAULT_HOST}`], options) :
        spawnSync('dep', ['deploy', `${process.env.DEPLOY_DEFAULT_HOST}`], options);

    if(isAsync){
        depSpawn.unref();
    } else {
        console.log(depSpawn.output.toString());
    }


}

function readReposFromJson(){
    let raw = fs.readFileSync(`${home_dir}/repo_inventory.json`, 'utf8');
    return JSON.parse(raw);
}