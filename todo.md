todo

Vocab Practice

Note : consider doing it backwards as well. As in, taking a book written in the target language, and translating unknown words back into the native language, while adding new vocab 1-3 at a time. Slowly, fewer and fewer words are translated into English. This would be for advanced applications. Or possibly intermediate applications, depending on the difficulty of the book.

It wouldn't be as fun, but technically, you can start learning with children's books, and eventually make your way up to normal books.

Refactor the dating sim to :
    
    - [ ] Read a text file
    - [ ] Count instances of each word
    - [ ] Sort words by greatest count to lowest count
    - [ ] Starting from the beginning of the array (greatest count), append any not-yet-learned-vocab to the new-vocab-buffer until the buffer is full, and flag them as newly-introduced-vocab
    - [ ] Grab and save translations for the newly appended vocabulary. 
    - [ ] Filter through the text document and replace any learned-vocab or newly-introduced-vocab with their translations.
        - [ ] For every translation, increase the confidence for that vocab word, but only as that word is scrolled past the top of the screen.
        - [ ] Attempt to predict vocab confidence down the page to reduce last minute changes during reading.
        - [ ] Should any 2 or more learned-vocab be adjacent to each other (without any punctuation in between them -- i.e. , . ; : - ( { [ / \ ~ etc... ), translate the vocabulary as a set, save the adjacent vocab as a new vocab-set entry and save its translation. 
            - [ ] Should any 2 or more learned-vocab be adjacent to each other, first search for it in the vocab-set entry. Else, create a new vocab-set entry
            - [ ] Once the number of entries in the vocab-sets reaches a sufficient size, attempt to extract sentence patterns from the data.
            - [ ] Should a sentence pattern be found, a generalized rule may be formed to simplify translations which match this pattern.
            - [ ] Patterns may also contain smaller patterns, and may also be a part of bigger patterns.
            - [ ] Should two patterns often be found adjacent, create a new pattern.
                - [ ] For new patterns, attempt to verify the pattern by generating new data by filling with random data from the expected set for each pattern variable, then evaluate and refine the pattern according to the discovered results.
            - [ ] Attempt to analyze differences between when patterns are translated individually and when they are translated separately

    - [ ] Add hover event to translated vocab, to display the original(native) translation of the individual vocab upon hovering the cursor over it.
        - [ ] Decrease the vocab confidence by .5 points and save time of last confidence decrease (time starts at hover exit). (Max decrease speed is 0.5 for every 10 seconds?).
    - [ ] Add click event to translated phrases (vocab-sets) to display the original phrase.
        - [ ] Decrease the phrase confidence the same way as the vocab confidence.
    - [ ] Add right click event pop-up to increase or decrease confidence levels for both vocab and phrases.
        - [ ] Also an input box to adjust the translation.
            - [ ] attempt to propagate the fix to other matching translations which use the same pattern & translation
    - [ ] 
