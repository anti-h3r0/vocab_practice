var text = document.getElementsByTagName('p');

for (var i = 0; i < 10; i++){
    console.log(text[i].textContent.search(/lohas/i));
}