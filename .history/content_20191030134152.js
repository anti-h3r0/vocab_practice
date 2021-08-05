var vocab_url = chrome.runtime.getURL("vocab.txt");
var spacer = " : ";
var endline = "\n";

var native_language = [];
var target_language = [];


function alterText(nl, tl) {
    var text = document.getElementsByTagName('p');
    
    for (var i = 0; i < text.length; i++) {
        for (var k = 0; k < nl.length; k++) {
            var n = text[i].textContent.toLowerCase().search(nl[k]);
            var s = text[i].textContent.indexOf(' ', n + 1);
    
            if (n != -1) {
                temp_string = text[i].textContent.substring(0, n) + tl[k];
                if (s != -1)
                    temp_string += text[i].textContent.substring(s)
                
                text[i].textContent = temp_string;
                //console.log(text[i].textContent);
            }
        }
    }
}

function getChineseRaw_Versatile_Mage(chapter) {
    var request = new XMLHttpRequest();
    url = "https://www.lread.net/read/22990/";
    chapter_ID = "22990";
    request.open('GET', url)
    request.send(null);
    request.onreadystatechange = function () {
        var resp = request.responseText.split("<dd>");
        console.log(resp[0]);
        console.log(resp[chapter]);

        // for (var i = 0; i < resp.length; i++){
        //     if (resp[i].search(chapter) != -1)
        //         if (resp[i].search("href=\"") != -1) {
        //             console.log(resp[i]);
        //             break;
        //         }
            
        // }
        // console.log(links);
        // if (links != -1) {
        //     resp.slice(0, links + chapter.length);
        //     ref_s = resp.lastIndexOf(chapter_ID + "/");
        //     ref_e = resp.indexOf(" ", ref_s) - 1;

        //     chapter_url = url + resp.substring(ref_s + chapter_ID.length, ref_e);
        //     console.log(chapter_url);
        // }
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

            getChineseRaw_Versatile_Mage("495");







        }
    }
}

getText(vocab_url);
