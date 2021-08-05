vocab_url = chrome.runtime.getURL("vocab.txt");




function alterText(dictionary) {
    for (var i = 0; i < 6; i++) {
        var n = text[i].textContent.search(/lohas/i);
        var s = text[i].textContent.indexOf(' ', n + 1);
    
        if (n != -1) {
            temp_string = "LOHAS" + text[i].textContent.substring(s);
            text[i].textContent = temp_string;
        }
    }
}

function getText(url)
{ 
    // read text from url location
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            console.log(request.responseText);
            vocab = request.responseText;
        }
    }
}

var vocab = getText(vocab_url);
var text = document.getElementsByTagName('p');

console.log("VOCAB:");
console.log(vocab);