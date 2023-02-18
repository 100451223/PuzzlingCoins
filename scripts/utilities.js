function chooseRandom(array) {
    /* Choose a random element from an array */

    return array[Math.floor(Math.random() * array.length)]
}

function getClickableItems(){
    /* Find an array of all of the (big enough) clickable elements in the page */

    let allItems = Array.prototype.slice.call(document.querySelectorAll('*'));
    let clickableItems = allItems.filter(function(element) {
        return window.getComputedStyle(element).cursor == "pointer" && element.offsetHeight>=30 && element.offsetWidth>=30;
    });
    return clickableItems;
}

function selectRandomClickableElems(clickableElemArray){
    /* Return n random HTML elements from an array*/

    let randomElements = [];
    for(let i=0; i<n; i++) {
        randomElements.push(chooseRandom(clickableElemArray))
    }
    return randomElements;
}

function createNewCoin(X,Y){
    /* Create a new coin element */

    let coin = document.createElement("img");
    coin.className = "coin";
    coin.src = chrome.extension.getURL("../images/coin.png");
    coin.style.left = X - 10 + "px";
    coin.style.top = Y - 10 + "px";
    document.body.appendChild(coin);

    return coin;
}

function animateCoin(coin){
    /* """Play""" an animation for the coin, then delete it */

    setTimeout(()=>{
        coin.classList.add("coin-animate");
    }, 50);

    setTimeout(function() {
        coin.classList.remove("coin-animate");
    }, 400);

    setTimeout(function() {
        coin.remove();
    }, 600);
}

function addCoinAudio(){
    /* Add an audio element to the page; it will only play the coin sound */

    let audio = document.createElement("audio");
    audio.src = chrome.extension.getURL("../audio/coin.mp3");
    audio.id = "coin-audio";
    document.body.appendChild(audio);
    return audio
}