const id = "5110d297585a9b5822da";
const sec = "9a3f8202553e8fecbb136778ec2e44c5ac823fa4";
const params = `?client_id=${id}&client_secret=${sec}`;

function getErrorMsg(message, username) {
  if (message === "Not Found") {
    return `${username} doesn't exist`;
  }
  return message;
}

// function which fetch github user profile
function getProfile(username) {
  return fetch(`https://api.github.com/users/${username}${params}`)
    .then(res => res.json())
    .then(profile => {
      if (profile.message) {
        throw new Error(getErrorMsg(profile.message, username));
      }

      return profile;
    });
}

// function which fetch github user repos
function getRepos(username) {
  return fetch(
    `https://api.github.com/users/${username}/repos${params}&per_page=100`
  )
    .then(res => res.json())
    .then(repos => {
      if (repos.message) {
        throw new Error(getErrorMsg(repos.message, username));
      }

      return repos;
    });
}

function getStarCount(repos) {
  return repos.reduce(
    (count, { stargazers_count }) => count + stargazers_count,
    0
  );
}

// calculate the score of two github users
function calculateScore(followers, repos) {
  return followers * 3 + getStarCount(repos);
}

// combine the getProfile and getRepos function to collectively get the data
function getUserData(player) {
  return Promise.all([getProfile(player), getRepos(player)]).then(
    ([profile, repos]) => ({
      profile,
      score: calculateScore(profile.followers, repos)
    })
  );
}

// sort ascendingly the players based on their scores
function sortPlayers(players) {
  return players.sort((a, b) => b.score - a.score);
}

// get both the user data and return the results
// this function will be exported
export function battle(players) {
  return Promise.all([getUserData(players[0]), getUserData(players[1])]).then(
    results => sortPlayers(results)
  );
}

export function fetchPopularRepos(language) {
  const endpoint = window.encodeURI(
    `https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`
  );

  return fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      if (!data.items) {
        throw new Error(data.messsage);
      }

      return data.items;
    });
}
