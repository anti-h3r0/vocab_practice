var text = document.getElementsByTagName('p');


for (var i = 0; i < 6; i++){
    var n = text[i].innerText.search(/lohas/i);

    if (n != -1)
        text[i].innerText.substring(n, n + 5) = "LOHAS"
}