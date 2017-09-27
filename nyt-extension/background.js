const API_KEY = "INSERT_API_KEY_HERE";
const BASE_URL = "https://api.nytimes.com/svc";

// 15 minutes
const UPDATE_INTERVAL = 15 * 60 * 1000;

let options;
let lastUpdated;
let cards;

const getUrl = () => {
  const {source, section} = options;
  const query = source === "topstories" ? `topstories/v2/${section}.json` : `mostpopular/v2/mostviewed/${section}/1.json`;
  return `${BASE_URL}/${query}?api-key=${API_KEY}`;
};

const getCards = () =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    const apiUrl = getUrl();
    req.addEventListener("load", () => {
      const {results} = JSON.parse(req.response);
      const newCards = results.slice(0, 20).map(response => {
        let {abstract, title, url, section, subsection} = response;
        let hostname = section || "nytimes";
        if (section && subsection) { hostname += ` / ${subsection}`; }
        let image = {width: 0, url: ""};
        // There are for some reason two ways that the api includes images for
        // articles, depending on which section you're retrieving. Try both.
        // eslint-disable-next-line no-shadow
        (response.multimedia || []).forEach(({type, width, url}) => {
          if (type === "image" && width > image.width && width <= 350) {
            image = {width, url};
          }
        });
        if (Array.isArray(response.media)) {
          const media = response.media.find(({type}) => type === "image");
          // eslint-disable-next-line no-shadow
          media["media-metadata"].forEach(({width, url}) => {
            if (width > image.width && width <= 350) {
              image = {width, url};
            }
          });
        }
        return {
          title,
          url,
          description: abstract,
          image: image.url,
          hostname
        };
      });
      resolve(newCards);
    });
    req.open("GET", apiUrl);
    req.send();
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

const onStorageChange = ({section, source, maxRows}) => {
  const sectionChange = section && (section.newValue !== options.section);
  const sourceChange = source && (source.newValue !== options.source);
  if (sectionChange) { options.section = section.newValue; }
  if (sourceChange) { options.source = source.newValue; }
  if (sectionChange || sourceChange) {
    browser.newTabSection.addCards([], true);
    cards = null;
    update();
  }
  if (maxRows && maxRows.newValue !== options.maxRows) {
    options.maxRows = parseInt(maxRows.newValue, 10);
    browser.newTabSection.setMaxRows(options.maxRows);
  }
};

const init = async () => {
  options = Object.assign(
    {section: "home", source: "topstories", maxRows: 1},
    await browser.storage.local.get()
  );
  browser.newTabSection.setMaxRows(parseInt(options.maxRows, 10));
  await update(true);
  browser.newTabSection.onSystemTick.addListener(update);
  browser.storage.onChanged.addListener(onStorageChange);
};

const uninit = async () => {
  browser.storage.onChanged.removeListener(onStorageChange);
  browser.newTabSection.onSystemTick.removeListener(update);
};

browser.newTabSection.onInitialized.addListener(init);
browser.newTabSection.onUninitialized.addListener(uninit);

browser.newTabSection.enable();
