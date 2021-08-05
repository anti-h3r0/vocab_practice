var vocab_url = chrome.runtime.getURL("vocab.json");
var vocab_delimiter = " : ";
var endline = "\n";
var vocab = {};
var fluency = {};

var fluent_threshold = 10;
var num_new_vocab = 20;

async function loadVocab(url) { 
    let vocab = {};
    // read text from url location
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            vocab = JSON.parse(request.responseText);
            // DEBUG
            // console.log(JSON.stringify(vocab, null, 2));
        }
    }
    return vocab;
}

function encode_utf8( s ){
    return unescape( encodeURIComponent( s ) );
}( '\u4e0a\u6d77' )

function isAlphaNumericApostrophe(c) {
    return c.length === 1 && c.match(/[a-z0-9']/i);
    //return c.toLowerCase() != c.toUpperCase();
}
function isAlphaNumeric(c) {
    return c.length === 1 && c.match(/[a-z0-9]/i);
}

function removeNonAlphaNumeric(str) {
    return str.replace(/[^a-zA-Z0-9 \-]+/g, "").split("-");
}

function formatRawParagraphElement(paragraph_element) {
    let formatted_paragraph = paragraph_element.textContent.replace(/\u2019/g, "\'");
    formatted_paragraph = formatted_paragraph.replace(/\u201D/g, "\"");
    formatted_paragraph = formatted_paragraph.replace(/\u201C/g, "\"");
    formatted_paragraph = formatted_paragraph.replace(/\u002C/g, " \,");

    return formatted_paragraph;
}

function countUnfamiliarVocab(fluency) {
    let count = 0;
    for (let [key, value] of Object.entries(fluency)) {
        if (value < fluent_threshold) count++;
    }

    return count;
}

function selectTopVocab(wordCount, vocab) {
    let newVocab = [];

    for (let index_hist of wordCount.counts) {
        if (newVocab.length >= 20) return newVocab;

        for (let potential_vocab of wordCount.dict[index_hist]) {
            if (!(potential_vocab in vocab)) {
                newVocab.push(potential_vocab);
            }
        }
    }

    if (newVocab.length == 0)
        console.log("no new vocab found");
    return newVocab;
}

function generateWordCount_paragraph(formatted_paragraph, wordCount) {
    let words = formatted_paragraph.split(" ");

    for (let uc_word of words) {
        let lc_word_array = removeNonAlphaNumeric(uc_word.toLowerCase());
        for (let lc_word of lc_word_array){
            if (lc_word === "") continue;

            if (lc_word in wordCount)
            wordCount[lc_word]++;
            else
            wordCount[lc_word] = 1;
        }
    }

    return wordCount;
}

function generateWordCount_page(html_paragraph_array) {
    let wordCount = {};

    // count
    for (let paragraph_element of html_paragraph_array) {
        wordCount = generateWordCount_paragraph(formatRawParagraphElement(paragraph_element), wordCount);
    }

    // aggregate
    let wc_histogram = {};
    let wc_hist_index_array = [];
    for (let [key, value] of Object.entries(wordCount)) {
        let key_hist = value.toString();
        if (key_hist in wc_histogram)
            wc_histogram[key_hist].push(key);
        else {
            wc_hist_index_array.push(value);
            wc_histogram[key_hist] = [key];
        }
    }

    // sort
    wc_hist_index_array = wc_hist_index_array.sort(function(a, b) { return b - a; });
    for (let key of Object.keys(wc_histogram)) {
        wc_histogram[key] = wc_histogram[key].sort();
    }

    return { counts: wc_hist_index_array, dict: wc_histogram };
}


function alterText(vocab) {
    let html_paragraph_array = document.getElementsByTagName('p');

    if (Object.keys(vocab).length > 0 && html_paragraph_array.length > 0) {
        for (let index_hp_array = 0; index_hp_array < html_paragraph_array.length; index_hp_array++) {
            let formatted_paragraph = formatRawParagraphElement(html_paragraph_array[index_hp_array]);
            let words = formatted_paragraph.split(" ");

            let depth = 0;
            let current_directory = vocab;

            let translation = [];

            for (let i = 0; i < words.length; i++) {
                let lc_word_array = removeNonAlphaNumeric(words[i].toLowerCase());

                for (let lc_word of lc_word_array) {
                    if (lc_word in current_directory) {
                        current_directory = current_directory[lc_word];
                        depth++;
                        console.log(lc_word + "->" + current_directory._default);
                    }
                    else if ("_default" in current_directory) {
                        translation.push(current_directory._default);
                        console.log(current_directory._default);
                        current_directory = vocab;
                        depth = 0;
                    }
                    else {
                        translation.push(lc_word);
                        if (depth > 0) {
                            console.error(depth + " : " + Object.keys(current_directory))
                            current_directory = vocab;
                        }
                    }
                }
            }

            html_paragraph_array[index_hp_array].textContent = words.join(" ");

        }
    }
}

async function main() {
    vocab = await loadVocab(vocab_url);

    // let count_unfamiliar_vocab = countUnfamiliarVocab(fluency);
    // if (count_unfamiliar_vocab < num_new_vocab) {
    //     let word_count = generateWordCount_page(html_paragraph_array);
    //     let new_vocab = selectTopVocab(word_count, vocab);
        
    //     console.log(new_vocab);
    // }


    alterText(vocab)
}
