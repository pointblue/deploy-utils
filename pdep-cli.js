#!/usr/bin/env node

let {RepoList} = require('.');

//configure the command line
let _argv = require('yargs').scriptName("pdep")
    .usage('$0 <cmd> [args]')
    .command('list [inventory_alias]', 'show all repos in the repo_inventory.json file', function(yargs){
        yargs.positional('inventory_alias', {
            type: 'string',
            describe: 'The alias of an inventory to list instead of the default inventory'
        })
    }, commandList)
    .command('list-update', 'Update local repo_inventory.json file with repos latest repos. Default git topics filters are \'prod\' and \'php56\' ', function(yargs){
    }, commandListUpdate)
    .option('t', {
        alias:'topics',
        requiresArg: true,
        describe: 'a space separated list of one or more topics that a repo must have to be included in the update',
        type: 'array'
    })
    .option('a', {
        alias:'alias',
        requiresArg: true,
        describe: 'an arbitrary alias to identify this update by name and save it separately from the default list',
        type: 'string'
    })
    .example('$0 list --help', 'list - help using the `list` command')
    .help()
    .argv
;

function commandList(argv) {

    let inventoryAlias = argv['inventory_alias'] ? argv['inventory_alias'] : '';

    RepoList.getLocalRepoList(inventoryAlias).then(function(repoList){

        let inventoryTitle = inventoryAlias.length === 0 ? 'default' : `'${inventoryAlias}'`;

        console.log(`Repos in the ${inventoryTitle} inventory: `)

        //show specific properties of each repo
        repoList.forEach(repo => {
            console.log(`${repo.name} | ${repo.html_url} | ${repo.topics}`);
        });
    });

}

function commandListUpdate(argv){

    //if no topics provided, uses 'prod' and 'php56' as default
    let topics = argv['topics'] ? argv['topics'] : ['prod', 'php56'];

    let alias = argv['alias'] ? argv['alias'] : '';


    RepoList.updateFromRemote(topics, alias).then(function(results){
        let aliasMessage = '';
        if(alias.length > 0) aliasMessage = ` (using alias ${alias})`;
        console.log('Inventory updated with a total of ' + results.recordsFetched + ` repos${aliasMessage}.`);
    });
}