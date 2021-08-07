// let API_KEY = undefined;
let API_KEY = "AIzaSyDibl1hawupwVNuH8iP1jT6iKrW_WJuV4E";

async function queryTranslation(fromLang, toLang, text) {
  console.log(`translating '${text}'`);

  if (!text || text === "") {
    alert("the text box has no value");
    return;
  }

  if (!API_KEY) {
    API_KEY = prompt("Please enter your api key", "");
    if (API_KEY && API_KEY != null)
      saveFile("key", API_KEY);
    else {
      API_KEY = undefined;
    }
  }

  if (API_KEY && API_KEY != null) {
    let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    url += '&q=' + encodeURI(text);
    url += `&source=${fromLang}`;
    url += `&target=${toLang}`;
    
    let res = await fetch(url, { 
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });
    
    let response = undefined;
    
    try {
      response = await res.json();
    }
    catch(e) {
      console.log("There was an error with the translation request: ", e);
    }
    console.log(JSON.stringify(response, null, 2));
    
    let translation = response?.data?.translations[0]?.translatedText;
    console.log(translation);

    if (typeof translation === "object"){
      alert(JSON.stringify(translation, null, 2));
      return "";
    }
    else if (!translation) 
      return "";

    return translation.toLowerCase();
  }
}
