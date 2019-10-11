require("dotenv").config();
const axios = require("axios");
const token = process.env.GHKEY;
const user = process.env.USERNAME; //YOUR API KEY HERE.
const user2 = process.env.PREVIOUS1; // previous user name
const user3 = process.env.PREVIOUS2;
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
const Array_of_pages = range(1, process.env.PAGES, 1);

// to implement function to accept as much previous name as user has changed as this affects the repo
// author and committer for a repo is based on the username and is not changed even if username is changed.

axios.interceptors.request.use(config => {
  config.headers.authorization = `bearer ${token}`;
  config.headers.accept = "application/vnd.github.cloak-preview";

  return config;
});


require("dotenv").config();


//step2 : get a subset of this year commit activity data per day starting with sunday.
const getAllPublicRepos = async () => {
  // for max of 10000 repos
  try{
  const ArrayOfAllPagesRepos = await Promise.all(
    Array_of_pages.map(async page => {
      const { data: repos } = await axios.get(
        `https://api.github.com/user/repos?per_page=100&page=${page}`
      );
      const reposInfo = repos.map(repo => {
        return {
          name: repo.name,
          type: repo.owner.type,
          fullname: repo.full_name
        };
      });

      return reposInfo;
    })
  );

  let AllRepos = [];
  ArrayOfAllPagesRepos.forEach(pageRepos => {
    pageRepos.forEach(Repo => AllRepos.push(Repo));
  });
  return AllRepos;
  }
  catch(err){
      console.log(err)
  }
};
const getSingleRepoActivity = async repoName => {
  try {
    const ArrayOfPagesOfRepoActivity = await Promise.all(
      Array_of_pages.map(async page => {
        let repo;
        if (repoName.type === "User") {
          repo = await axios.get(
            `https://api.github.com/repos/${user}/${repoName.name}/commits?per_page=10000&page=${page}`
          );
        }
        if (repoName.type === "Organization") {
          repo = await axios.get(
            `https://api.github.com/repos/${repoName.fullname}/commits?per_page=100&page=${page}`
          );
        }
        const publicRepoCommitsByUser = await repo.data.filter(
          commits =>
            commits.commit.committer.name === user ||
            commits.commit.committer.name === user2 ||
            commits.commit.committer.name === user3
        );
        return publicRepoCommitsByUser
        })
    );
    let AllReposActivity = [];
    ArrayOfPagesOfRepoActivity.forEach(pageCommits => {
      pageCommits.forEach(Commit => AllReposActivity.push(Commit.commit.committer.date
      ));
    });
    const repoactivity = {
      repoName:repoName.name,
      commits: AllReposActivity
    };
    return repoactivity;
  } catch (err) {
    return null;
  }
};
const getAllReposActivity = async reposNameArray => {
  try {
    const reposName = await reposNameArray;
    const activities = await Promise.all(
      reposName.map(repoName => getSingleRepoActivity(repoName))
    );
    return activities;
  } catch (err) {
    console.log(err.toString());
  }
};
//step3: get all commits sum for all repos

const getAllCommits = async value => {
    try{
  const gottenValue = await value;
  const allWeeklyTotals = gottenValue.map(activity =>  
    {
    return ({
      name: activity.repoName,
      commits: activity.commits.length
    })
  })
  const allCommits = allWeeklyTotals.reduce(
    (WeeklyTotal, number) => WeeklyTotal + number.commits,
    0
  );
  return allCommits;
    }
    catch(err){
        console.log(err.toString())
    }
};
// to work on this year alone
const getfirstCommitDate = async value => {
    try{
  const activities = await value;
    const AllReposFirstCommitDate = activities.map(activity => {
        const sortedCommits = activity.commits.sort()
        firstCommitDate = sortedCommits[sortedCommits.length -1]
        // get firstweek in github graph
        //
        return firstCommitDate
    })
    const firstCommitDateInTheYear = AllReposFirstCommitDate.sort((a, b)=> a-b)
    const firstCommitDate = firstCommitDateInTheYear[0]
    return firstCommitDate;
}
catch(err){
    console.log(err.toString())
}
};
// to work on this year alone
const getLastCommitDate = async(value) => {
    try{
        const activities = await value;
        const AllReposLastCommitDate = activities.map(activity => {
            const sortedCommits = activity.commits.sort()
            lastCommitDate = sortedCommits[0]
            return lastCommitDate
        })
        const lastCommitDateInTheYear = AllReposLastCommitDate.sort((a, b)=> a-b)
        const lastCommitDate = lastCommitDateInTheYear[lastCommitDateInTheYear.length -1]
        return lastCommitDate;
    }
    catch(err){
        console.log(err.toString())
    }

const spreadCommitsAcrossTimeFrame = (firstCommitDate , lastCommitDate, allCommits) => {
    const daysDifference = (lastCommitDate.getTime() - firstCommitDate.getTime())/(1000 * 3600 * 24)
    Math.floor(Math.random() * 30)


};

// const convertCommitsToContributions = () => {};
// getAllReposActivity(getAllRepos());
// getAllPublicRepos()

// getSingleRepoActivity({
//     name: 'wtc-frontend',
//     type: 'Organization',
//     fullname: 'where-to-code/wtc-frontend'
//   })
