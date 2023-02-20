// Description: This script is injected into the page when the extension is enabled
const n = 10; // Number of coins to drop

// Add an audio element
let audio = addCoinAudio();




initialSetUp()
const clickableItems = getClickableItems();

if (clickableItems.length!=0){

  const randomCoinElements = selectRandomClickableElems(clickableItems);

  for(let i=0; i<n; i++) {

      console.log(randomCoinElements[i]);

      randomCoinElements[i].addEventListener("click", function(event) {
          console.log(event.cancelable);
          event.preventDefault();
          
          audio.play();
          
          let newCoin = createNewCoin(event.pageX, event.pageY);

          incrementUsersCoinAmount();

        }, {once : true});

  }

} else {
  console.log("Oh my! It appears to be no coins in this page!\nBut don't despair, a true gentleman nevers gives up, I am certain that you will are coins in other pages.");
}

initialSetUp();