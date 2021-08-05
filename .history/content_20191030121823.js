var vocab_url = chrome.runtime.getURL("vocab.txt");
var spacer = " : ";
var endline = "\n";

var native_language = [];
var target_language = [];


function alterText(nl, tl) {
    var text = document.getElementsByTagName('p');
    
    for (var i = 0; i < 6; i++) {
        for (var k = 0; k < nl.length; k++) {
            var n = text[i].textContent.search(/lohas/i);
            var s = text[i].textContent.indexOf(' ', n + 1);
    
            if (n != -1) {
                temp_string = "LOHAS" + text[i].textContent.substring(s);
                text[i].textContent = temp_string;
            }
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
            var vocab = request.responseText;
            console.log(vocab);
            var num_lines = vocab.split("\n").length;
            num_lines--;
            
            for (var i = 0; i < num_lines; i++){
                var n = vocab.search(spacer);
                var e = vocab.search(endline);
                native_language.push(vocab.substring(0, n));
                target_language.push(vocab.substring(n + spacer.length, e));
                vocab = vocab.slice(e + 1);
            }

            console.log("\nVOCAB:");

            for (var i = 0; i < native_language.length; i++){
                console.log(native_language[i] + " -> " + target_language[i]);
            }











        }
    }
}

getText(vocab_url);
