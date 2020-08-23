const {Octokit} = require("@octokit/rest");

const OWNER = process.env.GIT_OWNER;


const octokit = new Octokit({
    auth: process.env.GIT_TOKEN
});


function getReposWithTopics(){
    return getOrgRepos()
        .then(addTopicsToRepos)
    ;
}

function getReposByTopic(topics){
    return getReposWithTopics()
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

let OrgRepos = {};

OrgRepos.getReposByTopic = getReposByTopic;

module.exports = OrgRepos;