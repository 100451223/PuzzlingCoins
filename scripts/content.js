// Description: This script is injected into the page when the extension is enabled
const n = 10; // Number of coins to drop

// Add an audio element
let audio = addCoinAudio();

function setWealthImage(coinsAmount){

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

function showWealth(){

  let usersCaseURL = chrome.extension.getURL("../json/usersCase.json");
  fetch(usersCaseURL)
    .then(response => response.json())
    .then(data => {
      
      wealthImage = setWealthImage(parseInt(data["coinsAmount"]))

      let outerDiv = document.createElement("div");
      outerDiv.className = "coinAmount";

      let innerImg = document.createElement("img");
      innerImg.src = chrome.extension.getURL(wealthImage);

      let innerTxt = document.createElement("p");
      innerTxt.id = "coinAmountTxt";
      innerTxt.innerText = "You have " + data["coinsAmount"] + " coins";

      outerDiv.appendChild(innerImg);
      outerDiv.appendChild(innerTxt);

      document.body.appendChild(outerDiv);
      setTimeout(()=>outerDiv.remove(), 5000);
    });

}

const clickableItems = getClickableItems();
const randomCoinElements = selectRandomClickableElems(clickableItems);

for(let i=0; i<n; i++) {

    console.log(randomCoinElements[i]);

    randomCoinElements[i].addEventListener("click", function(event) {
        event.preventDefault();
        
        audio.play();
        
        let newCoin = createNewCoin(event.pageX, event.pageY);

        animateCoin(newCoin);

        showWealth();


      }, {once : true});

}
