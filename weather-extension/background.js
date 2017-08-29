const API_KEY = "INSERT_API_KEY_HERE";
const BASE_URL = `https://api.darksky.net/forecast`;

const icons = ["clear-day", "clear-night", "rain", "snow", "sleet", "wind",
  "fog", "partly-cloudy-day", "partly-cloudy-night", "hail", "thunderstorm"];

// An hour
const UPDATE_INTERVAL = 60 * 60 * 1000;

const getCards = async () => {
  const {coords} = await new Promise(resolve =>
    navigator.geolocation.getCurrentPosition(pos => resolve(pos)));
  return new Promise(resolve => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", () => {
      const data = JSON.parse(req.response);
      resolve(data.daily.data.map(({icon, summary, time, temperatureMax, temperatureMin}) => {
        const lang = browser.i18n.getUILanguage().replace("_", "-");
        const dateOptions = {weekday: "short"};
        const day = (new Date(time * 1000)).toLocaleDateString(lang, dateOptions);
        const iconPath = `icons/${icons.includes(icon) ? icon : "partly-cloudy-day"}.svg`;
        return {
          title: `${day} | high ${temperatureMax.toFixed(0)}° | low ${temperatureMin.toFixed(0)}°`,
          image: browser.extension.getURL(iconPath),
          description: summary
        };
      }));
    });
    req.open("GET", `${BASE_URL}/${API_KEY}/${coords.latitude},${coords.longitude}`);
    req.send();
  });
};

let lastUpdated = 0;
let cards;

const refresh = async (forceRefresh = false) => {
  if (!cards || forceRefresh || Date.now() - lastUpdated > UPDATE_INTERVAL) {
    cards = await getCards();
    browser.newTabSection.addCards(cards, true);
    lastUpdated = Date.now();
  }
};

const init = async () => {
  await refresh(true);
  browser.newTabSection.onSystemTick.addListener(refresh);
};

const uninit = () => {
  browser.newTabSection.onSystemTick.removeListener(refresh);
};

browser.newTabSection.onInitialized.addListener(init);
browser.newTabSection.onUninitialized.addListener(uninit);

browser.newTabSection.enable();
