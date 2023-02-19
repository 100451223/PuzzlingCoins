// Description: This script is injected into the page when the extension is enabled
const n = 10; // Number of coins to drop

// Add an audio element
let audio = addCoinAudio();




initialSetUp()
const clickableItems = getClickableItems();
const randomCoinElements = selectRandomClickableElems(clickableItems);





for(let i=0; i<n; i++) {

    console.log(randomCoinElements[i]);

    randomCoinElements[i].addEventListener("click", function(event) {
        event.preventDefault();
        
        audio.play();
        
        let newCoin = createNewCoin(event.pageX, event.pageY);

        incrementUsersCoinAmount();

        animateCoin(newCoin);


      }, {once : true});

}

initialSetUp();