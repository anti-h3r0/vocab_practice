vocab_url = chrome.runtime.getURL("vocab.txt");

function getText(url, str)
{ 
    // read text from url location
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            if (request.responseType === "text")
                console.log(request.responseText);
                str = request.responseText;
        }
        else
            str = "failed readystatechange"
    }
}

var vocab = "vocab_default";
getText(vocab_url, vocab);
console.log("VOCAB:");
console.log(vocab);
var text = document.getElementsByTagName('p');


for (var i = 0; i < 6; i++){
    var n = text[i].textContent.search(/lohas/i);
    var s = text[i].textContent.indexOf(' ', n + 1);
    
    if (n != -1) {
        temp_string = "LOHAS" + text[i].textContent.substring(s);
        text[i].textContent = temp_string;
    }
}