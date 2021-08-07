var vocab_url = chrome.runtime.getURL("vocab.json");
var vocab_delimiter = " : ";
var endline = "\n";
var vocab = undefined;
var timer = null;
var scroll_speed = 200;
var topVocab = undefined;

let native_language = "en";
let target_language = "es";

var num_new_vocab = 20;
var HTML_open_tag = "<";
var HTML_close_tag = ">";

var toast_counter = 0;

var fluency_thresholds = [
    [30, "mastered"],
    [25, "fluent"],
    [20, "semi-fluent"],
    [10, "learned-word"],
    [5, "practicing"],
    [0, "new-word"],
    [-1, "ERROR"]
]

function readLocalStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], function(result) {
            if (result != undefined) {
                resolve(result);
            } else {
                reject();
            }
        });
    });
}

async function loadVocab() { 
    // read text from url location
    let result = await readLocalStorage('vocab');
    
    if (!result || !result.vocab || Object.keys(result.vocab).length === 0){
        vocab = await fetch(vocab_url);
        vocab = await vocab.json();
        console.log("loading default vocab");
    } else {;
        vocab = result.vocab;
        console.log("loading vocab from storage");
    }
}

async function saveVocab() {
    // todo : only save differences?
    chrome.storage.sync.set({vocab: window.vocab}, function() {
        console.log("saving vocab to storage");
    });
}

function getFluencyClass(fluency){
    for (let [threshold, class_name] of fluency_thresholds) {
        if (fluency >= threshold) return class_name;
    }
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

function tokenize(sentence) {
    let non_alpha_index_array = [];
    for (let i = 0; i < sentence.length; i++) {
        if (sentence[i].match(/[^a-zA-Z']+/g)){
            non_alpha_index_array.push(i);
        }
    }
    non_alpha_index_array.push(sentence.length);

    let already_translated_vocab_index_array = [];
    for (let i = 0; i < sentence.length; i++){
        let start = sentence.slice(i).indexOf('<span class="translated');
        if (start < 0) break;
        start += i;
        let end = -1;
        let intermediary = start + 1;

        while (end < 0 && intermediary < sentence.length) {
            end = sentence.slice(intermediary).indexOf('</span>');
            if (end < 0)
                throw new Error("translation block started, but not completed : '" + sentence + "'");
            end += start + 1;
            let temp = sentence.slice(intermediary).indexOf('<span');
            if (temp > 0)
                intermediary = temp + intermediary;
            if (temp >= 0 && intermediary < end) 
                end = -1
        }

        end += "</span>".length - 1;
        already_translated_vocab_index_array.push({start: start, end: end});
        i = end + 1;
    }

    let token_array = [];
    let previous_index = 0;
    let index_atvia = 0;
    let inside_tag = false;
    let already_translated = false;

    for (let i_naa of non_alpha_index_array) {
        if (!inside_tag && !already_translated) {
            let token_str = sentence.slice(previous_index, i_naa);
            if (token_str !== "") token_array.push({alpha: true, text: token_str});
            
            // maintain integrity of HTML tags
            if (sentence[i_naa] === HTML_open_tag){
                if (i_naa === already_translated_vocab_index_array[index_atvia]?.start)
                    already_translated = true;
                else
                    inside_tag = true;

                previous_index = i_naa;
            }
            else {
                token_str = sentence.slice(i_naa, i_naa + 1);
                if (token_str !== "") token_array.push({alpha: false, text: token_str});
                previous_index = i_naa + 1;
            }
        }
        
        // maintain integrity of HTML tags
        if (sentence[i_naa] == HTML_close_tag) {
            if (already_translated) {
                if (i_naa === already_translated_vocab_index_array[index_atvia]?.end) {
                    let token_str = sentence.slice(previous_index, i_naa + 1);
                    if (token_str !== "") token_array.push({alpha: false, text: token_str});
                    previous_index = i_naa + 1;
                    index_atvia++;
                    already_translated = false;
                }
            }
            else {
                let token_str = sentence.slice(previous_index, i_naa + 1);
                if (token_str !== "") token_array.push({alpha: false, text: token_str});
                previous_index = i_naa + 1;
                inside_tag = false;
            }
        }
    }
    
    return token_array;
}

function removeNonAlphaNumeric(str) {
    return str.replace(/[^a-zA-Z0-9' \-]+/g, "").split("-");
}

function formatRawParagraphElement(paragraph_element) {
    let formatted_paragraph = paragraph_element.innerHTML.replace(/\u2019/g, "\'");
    formatted_paragraph = formatted_paragraph.replace(/\u201D/g, "\"");
    formatted_paragraph = formatted_paragraph.replace(/\u201C/g, "\"");
    return formatted_paragraph.replace(/\u002C/g, "\,");
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
        if (newVocab.length >= 100) return newVocab;

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

function concatTokenPath(index_start, index_end, tokens) {
    let sentence = "";
    let start = tokens[index_start].text.match(/[^a-zA-Z']/i)? index_start + 1 : index_start;
    let end = tokens[index_end].text.match(/[^a-zA-Z']/i)? index_end - 1 : index_end;
    for (let i = start; i <= end; i++)
        sentence += tokens[i].text;

    return sentence
}

function getTranslation(current_directory, index_start, index_end, tokens) {
    if (index_end < index_start) return "";
    let original_sentence = concatTokenPath(index_start, index_end, tokens);
    if (!!current_directory._default) 
        return `<span class="translated missing-onclick-listener ${getFluencyClass(current_directory._fluency)}" title="${original_sentence}">${current_directory._default}</span>`;
    
    return original_sentence;
}

async function alterText() {
    let html_paragraph_array = document.getElementsByTagName('p');

    if (Object.keys(vocab).length > 0 && html_paragraph_array.length > 0) {
        let word_count = generateWordCount_page(html_paragraph_array);
        topVocab = selectTopVocab(word_count, vocab);

        for (let index_hpa = 0; index_hpa < html_paragraph_array.length; index_hpa++) {
            if (!isElementInViewport(html_paragraph_array[index_hpa]))
                continue;

            let formatted_paragraph = formatRawParagraphElement(html_paragraph_array[index_hpa]);
            let tokens = tokenize(formatted_paragraph)
            let current_directory = vocab;
            let index_previous = -1;
            let altered_text = [];

            for (let index_current = 0; index_current < tokens.length; index_current++) {
                if (tokens[index_current].text === " ") {
                    if (index_current - index_previous === 1) {
                        altered_text.push(tokens[index_current].text);
                        index_previous = index_current;
                        current_directory = vocab;
                    }
                }
                else if (!tokens[index_current].alpha) {
                    let temp = getTranslation(current_directory, index_previous + 1, index_current - 1, tokens);
                    if (temp !== "") {
                        altered_text.push(temp);
                        current_directory._fluency += 1;
                    }
                    if (index_current > 1 && tokens[index_current - 1].text === " " && (index_current - index_previous) > 2) 
                        altered_text.push(" ");
                    altered_text.push(tokens[index_current].text);
                    index_previous = index_current;
                    current_directory = vocab;
                }
                else {
                    let lc_word = tokens[index_current].text.toLowerCase();
                    
                    if (lc_word in current_directory) {
                        current_directory = current_directory[lc_word];
                    }
                    else {
                        let found = false;
                        if (index_current - index_previous === 1) {
                            for (let index_generic of vocab._generic_keys) {
                                if (lc_word in vocab[index_generic]) {
                                    current_directory = vocab[index_generic][lc_word];
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                altered_text.push(tokens[index_current].text);
                                current_directory = vocab;
                                index_previous = index_current;
                                found = true;
                            }
                        }
                        if (!found) {
                            // get translated text, or else get the original_sentence should no translation be found
                            let temp = getTranslation(current_directory, index_previous + 1, index_current - 1, tokens);
                            if (temp !== "") {
                                altered_text.push(temp);
                                current_directory._fluency += 1;
                                index_current--;
                                if (tokens[index_current].text === " ") 
                                    altered_text.push(" ");
                            } else {
                                console.error("missing translation for : " + index_previous + "-" + index_current + "\n" + JSON.stringify(tokens, null, 2));
                            }
                            current_directory = vocab;
                            index_previous = index_current;
                        }
                    }
                }
            }

            html_paragraph_array[index_hpa].innerHTML = altered_text.join("");
        }
    }
    let elements_missing_onClick = document.getElementsByClassName("missing-onclick-listener");
    for (let ele of elements_missing_onClick)
        ele.addEventListener("click", () => selectText(ele.title, ele.textContent));
    
    for (let ele of elements_missing_onClick)
        ele.classList.remove("missing-onclick-listener");

    await saveVocab();
}

function getFluencyValue(vocab_set) {
    let words = vocab_set.split(" ");

    let current_directory = vocab;
    for (let w of words) {
        if (w in current_directory)
            current_directory = current_directory[w];
        else {
            let found = false;
            for (let index_generic of vocab._generic_keys){
                if (w in vocab[index_generic]){
                    current_directory = vocab[index_generic][w];
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.error("unable to find vocab entry for : '" + w + "' in '" + vocab_set + "'\n" + JSON.stringify(vocab, null, 2))
                return -1;
            }
        }
    }

    if (!current_directory?._fluency && current_directory?._fluency !== 0) {
        console.error("unable to find fluency record for : '" + vocab_set + "'\n" + JSON.stringify(vocab, null, 2))
        return -1;
    }

    return current_directory._fluency;
}

function adjustColors() {
    let translated_vocab = document.getElementsByClassName("translated");

    for (let vocab_element of translated_vocab) {
        for(let [fluency, className] of fluency_thresholds)
            vocab_element.classList.remove(className);
        
        let fluencyValue = getFluencyValue(vocab_element.title.toLowerCase());
        vocab_element.classList.add(getFluencyClass(fluencyValue));
    }
}

// https://stackoverflow.com/questions/123999/how-can-i-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

function vocabPractice_SettingsIcon() {
    console.log("adding settings icon");
    let settings_icon = document.createElement("div");
    let icon_text = document.createTextNode(": Vocab Practice Settings :");
    settings_icon.id = "settings-icon";
    settings_icon.appendChild(icon_text);
    settings_icon.addEventListener("click", openSettings);

    let text_selection_box = document.createElement("input");
    text_selection_box.id = "text-selection-box";

    let text_translation_box = document.createElement("input");
    text_translation_box.id = "text-translation-box";
    
    let text_translation_submit = document.createElement("button");
    text_translation_submit.textContent = "submit";
    text_translation_submit.addEventListener("click", newVocabSubmission);
    text_translation_submit.classList.add("button");
    text_translation_submit.classList.add("grey-button");
    text_translation_submit.classList.add("half-width");

    let text_translation_cancel = document.createElement("button");
    text_translation_cancel.textContent = "cancel";
    text_translation_cancel.addEventListener("click", function() {
        document.getElementById("settings-edit-vocab-container").classList.add("hidden");
    });
    text_translation_cancel.classList.add("button");
    text_translation_cancel.classList.add("grey-button");
    text_translation_cancel.classList.add("half-width");
    
    let buttons = document.createElement("div");
    buttons.id = "settings-edit-vocab-submit";
    buttons.classList.add("full-width");
    buttons.appendChild(text_translation_cancel);
    buttons.appendChild(text_translation_submit);
    
    let translation_api_call = document.createElement("button");
    translation_api_call.id = "google-translate-button";
    translation_api_call.textContent = "google translate";
    translation_api_call.addEventListener("click", updateApiTranslation);
    translation_api_call.classList.add("button");
    translation_api_call.classList.add("yellow-button");
    translation_api_call.classList.add("full-width");
    
    let verb_api_call = document.createElement("button");
    verb_api_call.id = "verb-api-button";
    verb_api_call.textContent = "verb combos";
    verb_api_call.addEventListener("click", advancedVerbApiQuery);
    verb_api_call.classList.add("button");
    verb_api_call.classList.add("grey-button");
    verb_api_call.classList.add("half-width");
    
    let noun_api_call = document.createElement("button");
    noun_api_call.id = "noun-api-button";
    noun_api_call.textContent = "noun combos";
    noun_api_call.addEventListener("click", advancedNounApiQuery);
    noun_api_call.classList.add("button");
    noun_api_call.classList.add("grey-button");
    noun_api_call.classList.add("half-width");
    
    let advanced_buttons = document.createElement("div");
    advanced_buttons.id = "advanced-buttons-container";
    advanced_buttons.classList.add("full-width");
    advanced_buttons.appendChild(verb_api_call);
    advanced_buttons.appendChild(noun_api_call);

    let recommendations_button = document.createElement("button");
    recommendations_button.id = "recommendations-button";
    recommendations_button.textContent = "vocab recommendations";
    recommendations_button.addEventListener("click", displayTopVocabRecommendations);
    recommendations_button.classList.add("button");
    recommendations_button.classList.add("green-button");
    recommendations_button.classList.add("full-width");

    let settings_edit_vocab_container = document.createElement("div");
    settings_edit_vocab_container.id = "settings-edit-vocab-container";
    settings_edit_vocab_container.classList.add("hidden");
    settings_edit_vocab_container.appendChild(text_selection_box);
    settings_edit_vocab_container.appendChild(text_translation_box);
    settings_edit_vocab_container.appendChild(buttons);
    settings_edit_vocab_container.appendChild(translation_api_call);
    settings_edit_vocab_container.appendChild(advanced_buttons);
    settings_edit_vocab_container.appendChild(recommendations_button);

    let settings_element = document.createElement("div");
    settings_element.id = "vocab-settings";
    settings_element.appendChild(settings_icon);
    settings_element.appendChild(settings_edit_vocab_container);
    
    document.getElementsByTagName("html")[0].appendChild(settings_element);
}

function openSettings() {
    let settings = document.getElementById("settings-edit-vocab-container");
    if (settings.classList.contains("hidden"))
        selectText("");

    else settings.classList.add("hidden");
}

function selectText(selection, translation="") {
    document.getElementById("settings-edit-vocab-container").classList.remove("hidden");
    document.getElementById("text-selection-box").value = selection;
    document.getElementById("text-translation-box").value = translation;
}

async function submitNewVocab(selection, translation) {
    if (!selection) {
        alert("selection is empty. could not save input");
        return;
    }
    if (!translation) {
        alert("translation is empty. could not save input");
        return;
    }

    let current_directory = vocab;
    for (let word of selection.split(" ")) {
        if (!(word in current_directory))
            current_directory[word] = {
                _default: null,
                _fluency: 0
            }    
        
        current_directory = current_directory[word];
    }

    if (translation == 'null')
        translation = null;
        
    current_directory._default = translation;
    current_directory._fluency = 0;

    alterText();
    document.getElementById("settings-edit-vocab-container").classList.add("hidden");
    toaster("saved translation : '" + selection + "' -> '" + translation + "'");
}
async function newVocabSubmission() {
    submitNewVocab(document.getElementById("text-selection-box").value.trim().replace("'", "\'"), document.getElementById("text-translation-box").value.trim());
}

async function updateApiTranslation() { 
    document.getElementById("text-translation-box").value = await queryTranslation(native_language, target_language, document.getElementById("text-selection-box").value);
};
async function advancedVerbApiQuery() {
    if (confirm(`362 use-case combinations for the verb '${document.getElementById("text-selection-box").value} will be compiled and translated. Do you wish to continue?`)) {
        let result = await queryVerbCombinations(native_language, target_language, document.getElementById("text-selection-box").value);
        if (result && confirm(`save combinations for the verb '${document.getElementById("text-selection-box").value}?`)) {   
            for (let index of result.sentences.length)
            submitNewVocab(result.sentences[index], result.translations[index]);
            await saveVocab();
            toaster("save complete.");
            console.log(JSON.stringify(window.vocab, null, 2)); // DEBUG
        }
    }
};

async function advancedNounApiQuery() {
    alert("this function is not yet implemented")
    // document.getElementById("text-translation-box").value = await queryNounCombinations(native_language, target_language, document.getElementById("text-selection-box").value);
};

async function displayTopVocabRecommendations() {
    let toast_id = "toast_" + toast_counter.toString();
    toast_counter++;
    
    let popup = document.createElement("div");
    popup.id = toast_id;
    popup.classList.add("toaster");
    popup.innerHTML = topVocab.join(" | ");

    let exit_button = document.createElement("button");
    exit_button.id = "exit-top-vocab-popup";
    exit_button.classList.add("button");
    exit_button.classList.add("grey-button");
    exit_button.classList.add("exit-button");
    exit_button.textContent = "X";
    exit_button.addEventListener("click", () => document.getElementById(toast_id).remove() );

    popup.appendChild(exit_button);
    document.getElementsByTagName("body")[0].appendChild(popup);
}

async function toaster(text) {
    console.log("toasting : " + text);
    let toast_id = "toast_" + toast_counter.toString();
    toast_counter++;

    let toast = document.createElement("div");
    toast.textContent = text;
    toast.id = toast_id;
    toast.classList.add("toaster");
    toast.classList.add("success");
    document.getElementsByTagName("html")[0].appendChild(toast);
    setTimeout(() => document.getElementById(toast_id).remove(), 3000);
}

async function run(vocab_url) {
    API_KEY = readLocalStorage("key");
    await loadVocab(vocab_url);
    await alterText();
    vocabPractice_SettingsIcon();
        
    window.addEventListener('scroll', function() {
        if(timer !== null) {
            clearTimeout(timer);        
        }
        timer = setTimeout(async function() {
            await alterText();
            adjustColors();
        }, scroll_speed);
    }, false);

    document.getElementsByTagName("body")[0].addEventListener('mouseup', function() {
        let selection = window.getSelection().toString().trim();
        if (selection)
            selectText(selection);
    });
    
}

run(vocab_url);
console.log("translating vocab...");