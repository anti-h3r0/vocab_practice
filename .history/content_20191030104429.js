var text = document.getElementsByTagName('p');

window.alert(text[3].textContent)

for (var i = 0; i < 6; i++){
    var n = text[i].textContent.search(/lohas/i);

    if (n != -1)
        text[i].textContent.substring(n, n + 5) = "LOHAS"
}