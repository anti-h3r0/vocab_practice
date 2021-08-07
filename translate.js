let fromLang = 'en';
let toLang = 'es' // translate to spanish
let text = 'my name is Andi, and I like pizza!';


const API_KEY = [YOUR_API_KEY];

let url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
url += '&q=' + encodeURI(text);
url += `&source=${fromLang}`;
url += `&target=${toLang}`;

fetch(url, { 
  method: 'GET',
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
})
.then(res => res.json())
.then((response) => {
  console.log("response from google: ", response);
})
.catch(error => {
  console.log("There was an error with the translation request: ", error);
});