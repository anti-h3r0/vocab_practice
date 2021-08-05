var vocab_url = chrome.runtime.getURL("vocab.txt");
var spacer = " : ";
var endline = "\n";
var native_language = new Object();
var target_language = new Object();


function alterText(dictionary) {
    var text = document.getElementsByTagName('p');
    
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
            var vocab = request.responseText;

            while (vocab != "") {
                var n = vocab.search(spacer);
                var e = vocab.search(endline);
            }













        }
    }
}

getText(vocab_url);

console.log("VOCAB:");
console.log(vocab);