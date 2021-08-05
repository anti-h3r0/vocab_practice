var vocab_url = chrome.runtime.getURL("vocab.txt");
var spacer = " : ";
var endline = "\n";
var native_language = [];
var target_language = [];


function encode_utf8( s ){
    return unescape( encodeURIComponent( s ) );
}( '\u4e0a\u6d77' )

function isAlphaNumeric(c) {
    return c.length === 1 && c.match(/[a-z0-9]/i);
    //return c.toLowerCase() != c.toUpperCase();
}


function subWord(nl, tl, current_paragraph, k, s, e) {
    temp_string = current_paragraph.substring(0, s) + tl[k] + current_paragraph.substring(e)

    current_paragraph = temp_string;
    i--;
}
// ' U+0027
// " U+0022

function alterText(nl, tl) {
    var text = document.getElementsByTagName('p');

    if (text.length > 0) {
        for (var i = 0; i < 20/*text.length*/; i++) {


            for (var k = 0; k < nl.length; k++) {
                
                var current_paragraph = text[i].textContent.replace('\u2019', "\'");
                current_paragraph = current_paragraph.replace('\u201D', "\"");
                current_paragraph = current_paragraph.replace('\u201C', "\"");
                var s = current_paragraph.toLowerCase().search(nl[k]);
                var e = s + nl[k].length;
    
                
                // trying to locate the bug
                // whatever I did fixed it, so i'm leaving it as such
                if (s == 0 || (s > 0 && !isAlphaNumeric(current_paragraph[s - 1]))) {
                    if (e === current_paragraph.length) {
                        subWord(nl, tl, text, i, k, s, e);
                    }
                    else if (e < current_paragraph.length) {
                        if (!isAlphaNumeric(current_paragraph[e])) {
                            if (current_paragraph[e] == "\&quotes") { }
                                
                            subWord(nl, tl, current_paragraph, k, s, e);
                        }
                    }
            
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
            //console.log(resp[chapter]);
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

            // for (var i = 0; i < native_language.length; i++){
            //     console.log(native_language[i] + " -> " + target_language[i]);
            // }


            alterText(native_language, target_language);

            //getChineseRaw_Versatile_Mage(495);

        }
    }
}

getText(vocab_url);
