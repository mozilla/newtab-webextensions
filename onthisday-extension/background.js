// 5 minutes
const UPDATE_INTERVAL =  5 * 60 * 1000;

const getImages = titles =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", () => {
      const {query} = JSON.parse(req.response);
      const images = {};
      for (const id in query.pages) { // eslint-disable-line guard-for-in
        const {title, thumbnail} = query.pages[id];
        if (title && thumbnail && thumbnail.source) {
          images[title] = thumbnail.source;
        }
      }
      resolve(images);
    });
    req.open("GET", `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${titles.join("|")}&piprop=thumbnail|name&pithumbsize=300`);
    req.send();
  });

const shuffle = array => {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
};

const getCards = (day, month) =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", async () => {
      const {data} = JSON.parse(req.response);
      let events = data.Events;
      shuffle(events);
      if (events.length > 40) { events = events.slice(0, 40); }
      const titles = events.filter(event => event.links.length > 0)
        .map(event => event.links[0].title);
      const images = await getImages(titles);
      resolve(events.map(event => {
        const {links, text, year} = event;
        const {link: url, title} = (links.length > 0 && links[0]) || {link: "", title: ""};
        return {
          url,
          title: year,
          description: text,
          image: images[title] || null
        };
      }));
    });
    req.open("GET", `http://history.muffinlabs.com/date/${month}/${day}`);
    req.send();
  });

let currentDate;
let lastUpdated;
let cards;

const getData = async (forceRefresh = false) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dateString =  `${day}/${month}`;
  if (!cards || dateString !== currentDate) {
    // If it's the next day then update and broadcast to existing tabs
    cards = await getCards(day, month);
    browser.newTabContent.addCards(cards.slice(0, 20), true);
    currentDate = dateString;
    lastUpdated = date;
  } else if (forceRefresh || date - lastUpdated >= UPDATE_INTERVAL) {
    // If it's been a while or we forceRefresh then update only new tabs
    shuffle(cards);
    browser.newTabContent.addCards(cards.slice(0, 20), false);
    lastUpdated = date;
  }
};

const onAction = action => {
  switch (action) {
    case "SystemTick":
      getData();
      break;
    case "NewTabOpened":
      getData(true);
      break;
  }
};

const init = async () => {
  browser.newTabContent.enableSection();
  await getData();
  browser.newTabContent.onAction.addListener(onAction);
};

const uninit = () => {
  browser.newTabContent.onAction.removeListener(onAction);
  browser.newTabContent.disableSection();
};

browser.newTabContent.onInitialized.addListener(init);
browser.newTabContent.onUninitialized.addListener(uninit);
