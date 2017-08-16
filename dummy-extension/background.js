const LONG_TEXT = "Cupcake ipsum dolor sit amet toffee jujubes jelly brownie. Cake cotton candy dragée lollipop jelly beans jelly-o powder oat cake. Fruitcake chocolate cake soufflé cake icing sugar plum chupa chups sesame snaps dessert. Danish gummi bears brownie topping soufflé sugar plum gummies fruitcake chupa chups. Donut jelly-o sugar plum pie pie. Toffee biscuit gingerbread apple pie. Macaroon muffin jujubes liquorice halvah cheesecake. Jelly caramels pie marzipan donut marshmallow chocolate cake sweet roll. Sesame snaps sugar plum cake gummies. Sesame snaps wafer toffee croissant cake ice cream. Tart chupa chups jelly-o jelly-o lollipop candy tart oat cake. Dessert biscuit cake. Topping pudding bonbon macaroon chocolate cake. Danish sweet roll toffee liquorice halvah gingerbread powder.";
const TITLE = "Dummy Title";
const LONG_TITLE = "Here's a Slightly Longer Dummy Title";
const image = "http://cdn.attackofthecute.com/February-13-2013-20-34-03-ii.jpg";
const type = "bookmark";
const hostname = "example.com";

let DUMMY_DATA = [
  {url: "http://www.example.com", type, image, hostname, title: TITLE, description: LONG_TEXT},
  {url: "http://www.example.com/1", type, image, title: LONG_TITLE, description: LONG_TEXT},
  {url: "http://www.example.com/2", image, hostname, title: TITLE, description: LONG_TEXT},
  {url: "http://www.example.com", type, hostname, title: LONG_TITLE, description: LONG_TEXT},
  {url: "http://www.example.com/1", image, title: TITLE, description: LONG_TEXT},
  {url: "http://www.example.com/2", type, image, title: LONG_TITLE, description: LONG_TEXT},
  {url: "http://www.example.com", hostname, title: TITLE, description: LONG_TEXT},
  {url: "http://www.example.com/1", title: LONG_TITLE, description: LONG_TEXT}
];

const shuffle = array => {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
};

const updateCards = () => {
  shuffle(DUMMY_DATA);
  browser.newTabContent.addCards(DUMMY_DATA, true);
};

const init = () => {
  browser.newTabContent.enableSection();
  updateCards();
  browser.newTabContent.onSystemTick.addListener(updateCards);
};

const uninit = () => {
  browser.newTabContent.onSystemTick.removeListener(updateCards);
  browser.newTabContent.disableSection();
};

browser.newTabContent.onInitialized.addListener(init);
browser.newTabContent.onUninitialized.addListener(uninit);
