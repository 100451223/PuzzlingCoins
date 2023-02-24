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
    /* Create a new coin element. Delete it after 550ms */

    let coin = document.createElement("img");
    coin.className = "coin";
    coin.src = chrome.extension.getURL("../images/coin.png");
    coin.style.left = X - 10 + "px";
    coin.style.top = Y - 10 + "px";
    document.body.appendChild(coin);

    setTimeout(function() {
        coin.remove();
      }, 550);

    return coin;
}

function addCoinAudio(){
    /* Add an audio element to the page; it will only play the coin sound */

    let audio = document.createElement("audio");
    audio.src = chrome.extension.getURL("../audio/coin.mp3");
    audio.id = "coin-audio";
    document.body.appendChild(audio);
    return audio
}

function setWealthImage(coinsAmount){
    /* Set the image for the wealth notification */

    //console.log(coinsAmount)
    let wealthImage = "../images/wealth/";

    if (coinsAmount>=0 && coinsAmount<=30)
        wealthImage += "001_030.png";
    else if (coinsAmount>=31 && coinsAmount<=50)
        wealthImage += "031_050.png";
    else if (coinsAmount>=51 && coinsAmount<=80)
        wealthImage += "051_080.png";
    else if (coinsAmount>=81 && coinsAmount<=150)
        wealthImage += "081_150.png";
    else if (coinsAmount>=151 && coinsAmount<=229)
        wealthImage += "151_229.png";
    else if (coinsAmount>=230)
        wealthImage += "230_inf.png";

    return wealthImage;
}

function showWealth(amount){
    /* Show the user how much money they have in a notification*/

    wealthImage = setWealthImage(amount)

    let outerDiv = document.createElement("div");
    outerDiv.className = "coinAmount";

    let innerImg = document.createElement("img");
    innerImg.src = chrome.extension.getURL(wealthImage);

    let innerTxt = document.createElement("p");
    innerTxt.id = "coinAmountTxt";
    innerTxt.innerText = "You have " +amount + " coins!";

    outerDiv.appendChild(innerImg);
    outerDiv.appendChild(innerTxt);

    document.body.appendChild(outerDiv);
    setTimeout(()=>{
        outerDiv.classList.add("disappearAnimation")
        setTimeout(()=>{outerDiv.remove();}, 950);
    }, 2500);

}

function initialSetUp(){
    /* Set up the local storage object for the user */

    chrome.storage.local.get(["usersCase"], (result) => {
        if (result.usersCase == undefined)
        chrome.storage.local.set({usersCase: {coinsAmount: 0, todayIs: new Date().getDate(), coinsToday: 0}});
        });
}

function incrementUsersCoinAmount(){
    /* Increment the amount of coins the user has */

    chrome.storage.local.get(["usersCase"], ((result) => {
        let newAmount = result.usersCase;
        newAmount.coinsAmount += 1;
        chrome.storage.local.set({usersCase: newAmount}, ()=>{
        console.log("Value is set to " + newAmount.coinsAmount)
        showWealth(parseInt(newAmount.coinsAmount));
        });
    }))

}