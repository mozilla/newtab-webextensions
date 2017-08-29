const sectionInput = document.querySelector("#section");
const topStoriesRadio = document.querySelector("#top-stories");
const mostPopularRadio = document.querySelector("#most-popular");
const mostPopularRadioLabel = document.querySelector("#most-popular-label");
const maxRowsInput = document.querySelector("#max-rows");

const noMostPopular = [
  "upshot",
  "sundayreview",
  "tmagazine",
  "obituaries",
  "insider"
];

const onChangeSection = () => {
  if (noMostPopular.includes(sectionInput.value)) {
    mostPopularRadio.style.display = "none";
    mostPopularRadioLabel.style.display = "none";
    topStoriesRadio.checked = true;
  } else {
    mostPopularRadio.style.display = "";
    mostPopularRadioLabel.style.display = "";
  }
};

const restoreSettings = ({section, source, maxRows}) => {
  sectionInput.value = section || "home";
  topStoriesRadio.checked = source !== "mostpopular";
  mostPopularRadio.checked = source === "mostpopular";
  maxRowsInput.value = maxRows || 1;
};

const storeSettings = () => {
  const source = topStoriesRadio.checked ? "topstories" : "mostpopular";
  const section = source === "mostpopular" && sectionInput.value === "home" ?
    "all-sections" :
    sectionInput.value;
  const maxRows = maxRowsInput.value;
  browser.storage.local.set({section, source, maxRows});
};

const onError = e => {
  console.log(e);
};

browser.storage.local.get().then(restoreSettings).catch(onError);

const saveButton = document.querySelector("#save-button");
sectionInput.addEventListener("change", onChangeSection);
saveButton.addEventListener("click", storeSettings);
