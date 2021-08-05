var vocab_url = chrome.runtime.getURL("vocab.txt");
var spacer = " : ";
var endline = "\n";
var native_language = [];
var target_language = [];


function isAlphaNumeric(c) {
    //return c.length === 1 && c.match(/[a-z0-9]/i);
    return c.toLowerCase() != c.toUpperCase();
}



function alterText(nl, tl) {
    var text = document.getElementsByTagName('p');

    if (text.length > 0) {
        for (var i = 0; i < text.length; i++) {
            for (var k = 0; k < nl.length; k++) {
                var s = text[i].textContent.toLowerCase().search(nl[k]);
                var e = s + nl[k].length;
    
                if (s == 0 ||
                    (s > 0 && !isAlphaNumeric(text[i].textContent[s - 1]) &&
                        (e === text[i].textContent.length ||
                            (e < text[i].textContent.length && !isAlphaNumeric(text[i].textContent[e])))
                    )) {
                    
                    if (nl[k] == "i")
                        console.log(nls[k] + " - " + text[i].textContent[e] + ":")

                    temp_string = text[i].textContent.substring(0, s) + tl[k] + text[i].textContent.substring(e)
            
                    text[i].textContent = temp_string;
                    i--;
            
                }
                else if (s > 0) {
                    console.log(text[i].textContent[s - 1] + " : " + nl[k]);
                }
            }
        }
    }
}


/// Error, Cross-Origin Read Blocking is halting the script. It needs to be called using a listener? by the background script... 
function getChineseRaw_Versatile_Mage(chapter) {
    var request = new XMLHttpRequest();
    url = "https://www.lread.net/read/22990/";
    chapter_ID = "22990";
    request.open('GET', url)
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var resp = request.responseText.split("<dd>");
            console.log(resp[chapter]);
            if (resp[chapter] != undefined) {
                var s = resp[chapter].search(chapter_ID) + chapter_ID.length + 1;
                var e = resp[chapter].indexOf("\"", s);

                chapter_url = url + resp[chapter].substring(s, e);
                console.log(chapter_url);
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
            var num_lines = vocab.split("\n").length - 1;
            
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


            alterText(native_language, target_language);

            //getChineseRaw_Versatile_Mage(495);

        }
    }
}

getText(vocab_url);
