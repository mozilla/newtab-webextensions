const API_KEY = "INSERT_API_KEY_HERE";
const BASE_URL = "https://api.github.com/graphql";

// 15 minutes
const UPDATE_INTERVAL = 15 * 60 * 1000;

let lastUpdated;
let cards;

const requestBody = `{"query": "query { viewer { login contributedRepositories(first: 5, affiliations:[OWNER,COLLABORATOR], orderBy: {field: UPDATED_AT, direction: DESC}) { edges { node { nameWithOwner issues(first: 30, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) { edges { node { number title url updatedAt author { login avatarUrl } authorAssociation assignees(last:10) { edges { node { login } } } } } } pullRequests(first:30, states:OPEN, orderBy:{field: UPDATED_AT, direction: DESC}) { edges { node { number title url updatedAt author { login avatarUrl } assignees(last: 10) { edges { node { login } } } reviewRequests(last:5) { edges { node { reviewer { login } } } } } } } } } } } }"}`;

const getCards = () =>
  new Promise(resolve => {
    const req = new XMLHttpRequest();
    const apiUrl = `${BASE_URL}?access_token=${API_KEY}`;
    req.addEventListener("load", () => {
      let data;
      try {
        data = JSON.parse(req.response).data;
      } catch (e) {
        console.error(e);
        // An error occured, resolve with no cards
        resolve([]);
      }

      const {viewer} = data;
      const {login, contributedRepositories} = viewer;

      const getCard = (item, nameWithOwner, type) => {
        const {author, number, assignees, title, reviewRequests, updatedAt, url} = item;

        const isAuthor = author.login === login;
        const isAssigned = assignees &&
          assignees.edges.some(({node: assignee}) => assignee.login === login);
        const isReviewRequested = reviewRequests &&
          reviewRequests.edges.some(({node: request}) => request.reviewer.login === login);

        let subtitle;
        if (isReviewRequested) {
          subtitle = "Your review requested";
        } else if (isAssigned) {
          subtitle = "Assigned to you";
        } else if (isAuthor && type === "PR") {
          subtitle = "You created";
        } else if (isAuthor && type === "Issue") {
          subtitle = "You reported";
        }

        return {
          title: `${type} #${number}${subtitle ? `: ${subtitle}` : ""}`,
          description: title,
          url,
          image: author.avatarUrl,
          hostname: nameWithOwner,
          updatedAt,
          isPriority: !!subtitle
        };
      };

      const newCards = [];

      for (const {node: repo} of contributedRepositories.edges) {
        const {nameWithOwner, pullRequests, issues} = repo;
        for (const {node: pr} of pullRequests.edges) {
          newCards.push(getCard(pr, nameWithOwner, "PR"));
        }
        for (const {node: issue} of issues.edges) {
          newCards.push(getCard(issue, nameWithOwner, "Issue"));
        }
      }

      newCards.sort((a, b) => {
        if (a.isPriority && !b.isPriority) {
          return -1;
        } else if (!a.isPriority && b.isPriority) {
          return 1;
        }
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });

      newCards.forEach(card => {
        delete card.updatedAt;
        delete card.isPriority;
      });

      resolve(newCards);
    });
    req.open("POST", apiUrl);
    req.setRequestHeader("Content-type", "application/json");
    req.send(requestBody);
  });

const update = async (forceUpdate = false) => {
  if (!cards || Date.now() - lastUpdated > UPDATE_INTERVAL) {
    cards = await getCards();
    browser.newTabSection.addCards(cards, true);
    lastUpdated = Date.now();
  } else if (forceUpdate) {
    browser.newTabSection.addCards(cards, true);
  }
};

const init = async () => {
  await update(true);
  browser.newTabSection.onSystemTick.addListener(update);
};

const uninit = () => {
  browser.newTabSection.onSystemTick.removeListener(update);
};

browser.newTabSection.onInitialized.addListener(init);
browser.newTabSection.onUninitialized.addListener(uninit);

browser.newTabSection.enable();
