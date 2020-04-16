#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const home_dir = require('os').homedir();
//TODO: check if file exists first
//use `npm install dotenv` to install dotenv requirement
require('dotenv').config({ path: `${home_dir}/.env` });

let repo_base_dir = process.env.DEPLOY_DIR;

let git_command = 'git clone';

let repos = readReposFromJson();

for(let i=0;i<repos.length;i++){
    console.log(execSync(`cd ${repo_base_dir} && ${git_command} ${repos[i].ssh_url}`).toString());
}

function readReposFromJson(){
    let raw = fs.readFileSync(`${home_dir}/repo_inventory.json`, 'utf8');
    return JSON.parse(raw);
}