// let API_KEY = undefined;
let API_KEY = "AIzaSyDibl1hawupwVNuH8iP1jT6iKrW_WJuV4E";

async function queryTranslation(from_lang, to_lang, text) {
  console.log(`translating '${text}'`);

  if (!text || text === "") {
    alert("the text box has no value");
    return;
  }

  if (!API_KEY) {
    API_KEY = prompt("Please enter your api key", "");
    if (API_KEY && API_KEY != null)
      saveVocab("key", API_KEY);
    else {
      API_KEY = undefined;
    }
  }

  if (API_KEY && API_KEY != null) {
    let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    url += '&q=' + encodeURI(text);
    url += `&source=${from_lang}`;
    url += `&target=${to_lang}`;
    
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
    
    let translation = response?.data?.translations[0]?.translatedText;

    if (typeof translation === "object"){
      alert(JSON.stringify(translation, null, 2));
      return "";
    }
    else if (!translation) 
      return "";

    return translation.toLowerCase();
  }
}



async function queryVerbCombinations(from_lang, to_lang, verb) {
  let temp = verb.split(" ");
  if (temp.length != 1) {
    alert(`I cannot translate the verb '${verb}'`);
    return undefined;
  }

  // TODO : analyze patterns and remove redundancies to prune this number of combinations down.

  let combinations = [];
  // 144 -> 1: <I|you|he|she|it|they> <should|will> <not|_> <need to|want to|_> <verb> <it|_>
  for (let a of ["I ", "you ", "they ", "he ", "she ", "it "]) {
    for (let b of ["should ", "will "]) {
      for (let c of ["not ", ""]) {
        for (let d of ["need to ", "want to ", ""]) {
          for (let e of [" it", ""]) {
            combinations.push(`${a}${b}${c}${d}${verb}${e}`);
          }
        }
      }
    }
  }

  // 144 -> 2: <I|you|he|she|it|they> <could|can> <not|_> <verb> <it|_>
  for (let a of ["I ", "you ", "they ", "he ", "she ", "it "]) {
    for (let b of ["could ", "can "]) {
      for (let c of ["not ", ""]) {
        for (let d of [" it", ""]) {
          combinations.push(`${a}${b}${c}${verb}${d}`);
        }
      }
    }
  }

  // 72  -> 3: <I|you|they> <do|don't|do not|_> <need to|want to|_> <verb> <it|_>
  for (let a of ["I ", "you ", "they "]) {
    for (let b of ["do ", "don't ", "do not ", ""]) {
      for (let c of ["need to ", "want to ", ""]) {
        for (let d of [" it", ""]) {
          combinations.push(`${a}${b}${c}${verb}${d}`);
        }
        }
    }
  }
  
  // 72  -> 4: <he|she|it> <does|doesn't|does not> <need to|want to|_> <verb> <it|_>
  for (let a of ["he ", "she ", "it "]) {
    for (let b of ["does ", "doesn't ", "does not "]) {
      for (let c of ["need to ", "want to ", ""]) {
        for (let e of [" it", ""]) {
          combinations.push(`${a}${b}${c}${verb}${e}`);
        }
      }
    }
  }

  // 72  -> 4: <he|she|it>  <needs to|wants to|_> <verb> <it|_>
  for (let a of ["he ", "she ", "it "]) {
    for (let c of ["needs to ", "wants to ", ""]) {
      for (let e of [" it", ""]) {
        combinations.push(`${a}${c}${verb}${e}`);
      }
    }
  }

  // 6   -> 5: <I|you|they> <verb> <it|_>
  for (let a of ["I ", "you ", "they ", "he ", "she ", "it "]) {
    for (let e of [" it", ""]) {
      combinations.push(`${a}${verb}${e}`);
    }
  }

  // 6   -> 6: <he|she|it> <verb><s> <it|_>
  for (let a of ["he ", "she ", "it "]) {
    for (let e of [" it", ""]) {
      combinations.push(`${a}${verb}s${e}`);
    }
  }
  
  // 4   -> 8: <a|the> <verb> <it|_>
  for (let a of ["a ", "the "]) {
    for (let e of [" it", ""]) {
      combinations.push(`${a}${verb}${e}`);
    }
  }

  // 4   -> 7: <to|_> <verb> <it|_>
  for (let a of ["to ", ""]) {
    for (let e of [" it", ""]) {
      combinations.push(`${a}${verb}${e}`);
    }
  }

  let translations = [];
  for (let sentence of combinations) {
    translations.push(await queryTranslation(from_lang, to_lang, sentence));
  }

  let result = {
    sentences: combinations,
    translations: translations
  };

  return result;
}