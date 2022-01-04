# vocab_practice

practice vocab during daily casual web browsing

*(screenshot below - note, I'm missing a screenshot of the settings GUI popup)*

## description
- This is a chrome extension that alters web pages to practice foreign language vocabulary by replacing any vocab you know with it's associated foreign word.
- to support other languages, change the language codes in the translate.js file. 
- Vocab are colored according to how often you see them: 
    - (from new -> mastered) = (red, orange, purple, dark-blue, light-blue, gray, black)

### translating sentences & nested json structure
- this extension utilizes Google Translate, but you can also input vocab manually. This was important because machine translation algorithms don't consistently translate with correct grammar, so the few incorrect translations can easily be manually adjusted by saving a new translation.
- Translations are then stored and maintained in your chrome local storage. 
- I opted to store direct translations for specific sentences using a nested-structured json file, which optimizes translations of full sentences (with almost no overhead), and always ensures that the longest known translation is found
    - (i.e. the input  `I have`  should produce the output  `Tengo`  not  `Yo Tener`

### translating conjugations
- the last thing you or I want to do is manually input translations for every conjugation of a verb. So congrats! I've automated that for you. 
- options to translate past present or future tense (note that your input should also be in past present or future tense in your native language)
```
    present tense -> 30 combinations
    past tense -> 8 combinations
    future tense -> 30 combinations
```



## images
![alt text](https://github.com/anti-h3r0/vocab_practice/blob/main/screenshots/alpha%20testing.png)
