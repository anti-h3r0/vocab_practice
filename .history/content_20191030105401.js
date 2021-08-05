var text = document.getElementsByTagName('p');


for (var i = 0; i < 6; i++){
    var n = text[i].textContent.search(/lohas/i);
    var s = text[i].textContent.indexOf(' ', n+1)

    if (n != -1)
        text[i].textContent = 
}