const { spawn } = require("child_process");
const { spawnSync } = require("child_process");
const RepoList = require('./RepoList');
const home_dir = require('os').homedir();
require('dotenv').config({ path: `${home_dir}/.env` });

const repo_base_dir = process.env.DEPLOY_DIR;

function runOnRepos(taskName, alias){

    RepoList.getLocalRepoList(alias).then(reposToDeploy => {

        //pass the remaining repos to deploy Async
        deployTask(taskName, reposToDeploy, repo_base_dir);
    });


}



function deployTask(taskName, repos, reposBaseDir, isAsync = true){
    for(let repo of repos){
        executeTask(taskName, repo, reposBaseDir, isAsync);
    }

}

function executeTask(taskName, repo, repoBaseDir, isAsync = true){
    let options = {
        cwd: `${repoBaseDir}/${repo.name}`
    };

    if(isAsync){
        options.detached = true;
        //TODO: Add error out
        options.stdio = 'ignore';
    }

    console.log(taskName, process.env.DEPLOY_DEFAULT_HOST, options);

    let depSpawn = isAsync ?
        spawn('dep', [taskName, `${process.env.DEPLOY_DEFAULT_HOST}`], options) :
        spawnSync('dep', [taskName, `${process.env.DEPLOY_DEFAULT_HOST}`], options);

    if(isAsync){
        depSpawn.unref();
    } else {
        console.log(depSpawn.output.toString());
    }


}

let DeployTask = {};

DeployTask.runOnRepos = runOnRepos;

module.exports = DeployTask;