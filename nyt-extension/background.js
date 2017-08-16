const API_KEY = "INSERT_API_KEY_HERE";
const BASE_URL = "https://api.nytimes.com/svc/topstories/v2/home.json";

// 15 minutes
const UPDATE_INTERVAL = 15 * 60 * 1000;

const getCards = () =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    const apiUrl = `${BASE_URL}?api-key=${API_KEY}`;
    req.addEventListener("load", () => {
      const {results} = JSON.parse(req.response);
      const cards = results.slice(0, 20).map(({abstract, title, url, multimedia}) => {
        let image = {width: 0, url: ""};
        // eslint-disable-next-line no-shadow
        multimedia.forEach(({type, width, url}) => {
          if (type === "image" && width > image.width && width <= 300) {
            image = {width, url};
          }
        });
        return {
          title,
          url,
          description: abstract,
          image: image.url,
          hostname: "nytimes"
        };
      });
      resolve(cards);
    });
    req.open("GET", apiUrl);
    req.send();
  });

let lastUpdated;
let cards;

const update = async () => {
  if (!cards || Date.now() - lastUpdated > UPDATE_INTERVAL) {
    cards = await getCards();
    browser.newTabContent.addCards(cards, true);
    lastUpdated = Date.now();
  } else if (cards) {
    browser.newTabContent.addCards(cards, true);
  }
};

const init = async () => {
  browser.newTabContent.enableSection();
  await update();
  browser.newTabContent.onSystemTick.addListener(update);
};

const uninit = async () => {
  browser.newTabContent.onSystemTick.removeListener(update);
  browser.newTabContent.disableSection();
};

browser.newTabContent.onInitialized.addListener(init);
browser.newTabContent.onUninitialized.addListener(uninit);
