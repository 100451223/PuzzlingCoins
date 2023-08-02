

class CoinManager{
  
	constructor(max_coins){
		this.max_coins = max_coins;
		this.coinAudio = this._addCoinAudio();
		this.coinImgs = {
			"001_030": "../images/wealth/001_030.png",
			"031_050": "../images/wealth/031_050.png",
			"051_080": "../images/wealth/051_080.png",
			"081_150": "../images/wealth/081_150.png",
			"151_229": "../images/wealth/151_229.png",
			"230_inf": "../images/wealth/230_inf.png"
		}
		this.noCoinMsg = "Oh my! It appears to be no coins in this page!\nBut don't despair, a true gentleman nevers gives up, I am certain that you will are coins in other pages."
	}

	_getClickableItems = () => {
		/* Find an array of all of the (big enough) clickable elements in the page */
	
		let allItems = Array.prototype.slice.call(document.querySelectorAll('*'));
		let clickableItems = allItems.filter(function(element) {
			return window.getComputedStyle(element).cursor == "pointer" && element.offsetHeight>=30 && element.offsetWidth>=30;
		});

		if (clickableItems.length == 0)
			return -1;
		else
			return clickableItems;
	}
	
	_selectRandomClickableElems = (clickableElemArray) => {
		/* Return at max n random HTML elements from an array*/
	
		let randomElements = [];
		for(let i=0; i<this.max_coins; i++) {
			if (i>=clickableElemArray.length)
				break;

			randomElements.push(chooseRandom(clickableElemArray))
		}
		
		return randomElements;
	}

	_selectCoinElements = () => {
		/* Return at max n random HTML elements from an array*/
		const clickableItems = this._getClickableItems();
		
		if (clickableItems == -1)
			return -1;
		else
			return this._selectRandomClickableElems(clickableItems);
	}

	_addCoinAudio = () => {
		/* Add an audio element to the page; it will only play the coin sound */
	
		let audio = document.createElement("audio");
		audio.src = chrome.extension.getURL("../audio/coin.mp3");
		audio.id = "coin-audio";
		document.body.appendChild(audio);
		
		return audio
	}

	_createNewCoin = (X, Y) => {
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

	_playCoinSound = () => {
		/* Play the coin sound */

		this.coinAudio.play();
		return 0;
	}

	_setWealthImage = (amount) => {
		/* Set the image for the wealth notification */
	
		if (amount>=0 && amount<=30)
			return this.coinImgs["001_030"];
		else if (amount>=31 && amount<=50)
			return this.coinImgs["031_050"];
		else if (amount>=51 && amount<=80)
			return this.coinImgs["051_080"];
		else if (amount>=81 && amount<=150)
			return this.coinImgs["081_150"];
		else if (amount>=151 && amount<=229)
			return this.coinImgs["151_229"];
		else if (amount>=230)
			return this.coinImgs["230_inf"];
		else
			return -1;
	}
	
	_showWealth = (amount) => {
		/* Show the user how much money they have in a notification*/
	
		let wealthImage = this._setWealthImage(amount)
	
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

		return 0;
	
	}

	_incrementUsersCoinAmount = () => {
		/* Increment the amount of coins the user has */
	
		chrome.storage.local.get(["usersCase"], ((result) => {
			let newAmount = result.usersCase;
			newAmount.coinsAmount += 1;
			chrome.storage.local.set({usersCase: newAmount}, ()=>{
			this._showWealth(parseInt(newAmount.coinsAmount));
			});
		}))
	
		return 0;
	}

	_coinClickHandler = (event) => {
		/* Handle the click on a coin */

		event.preventDefault();
		this._playCoinSound();
		this._createNewCoin(event.pageX, event.pageY);
		this._incrementUsersCoinAmount();
	}
		

	addCoins = () => {
		// Get all clickable items
		
		const coinElements = this._selectCoinElements();

		// Check if there are clickable items in the page. If not, do nothing
		if(coinElements == -1){
			console.log(this.noCoinMsg);
			return;
		}

		for(let i=0; i<coinElements.length; i++) {
			console.log(coinElements[i]);
	
			// Add the coin sound and animation to the element. The event will only fire once
			coinElements[i].addEventListener("click", this._coinClickHandler, {once : true});
		}

		return 0;
	}

}