function _createUpperScreen(number, name){
    /* Create the upper screen of the puzzle canvas */

    let upperScreen = document.createElement("div");
    upperScreen.id = "upperScreen"
    upperScreen.className = "halfScreenFlex";

    let puzzleNumber = document.createElement("h1");
    puzzleNumber.className = "puzzleTitleNumber";
    puzzleNumber.innerHTML = number;

    let puzzleTitle = document.createElement("h3");
    puzzleTitle.className = "puzzleTitleNumber";
    puzzleTitle.innerHTML = name;

    upperScreen.appendChild(puzzleNumber);
    upperScreen.appendChild(puzzleTitle);

    return upperScreen;
}

function _createLowerScreen(picarats){
    /* Create the lower screen of the puzzle canvas */    

    let lowerScreen = document.createElement("div");
    lowerScreen.id = "lowerScreen"
    lowerScreen.className = "halfScreenFlex";

    let picaratsCount = document.createElement("h1");
    picaratsCount.className = "puzzleTitleNumber";
    picaratsCount.innerHTML = picarats;

    lowerScreen.appendChild(picaratsCount);

    return lowerScreen;
        
}

function _createLeftButtons(){
    /* Create the left lower buttons: Hints and Exit, there shall be NO NOTES */

        let leftButtons = document.createElement("div");
        leftButtons.className = "leftButtons";
    
        let hintsButton = document.createElement("button");
        hintsButton.className = "puzzleButton";
        hintsButton.innerHTML = "HINTS";
    
        let outButton = document.createElement("button");
        outButton.className = "puzzleButton";
        outButton.innerHTML = "EXIT";
    
        leftButtons.appendChild(hintsButton);
        leftButtons.appendChild(outButton);
    
        return leftButtons;
    
}

function _createRightButton(){
    /* Create the right lower button: Check */
        
    let rightButton = document.createElement("button");
    rightButton.className = "rightButtons puzzleButton";
    rightButton.innerHTML = "SUBMIT";
    
    return rightButton;
        
}

function _fadeScreen(canvas){
    /* This fades whatever is on BOTH the upper and lower screens */
    
    /* Dummy black screen */
    let blackScreen = document.createElement("img");
    blackScreen.src = chrome.extension.getURL("../images/blackScreen.png");
    blackScreen.className = "blackScreen";

    canvas.querySelector("#lowerScreen").appendChild(blackScreen);
    canvas.querySelector("#upperScreen").appendChild(blackScreen.cloneNode(true));
    
    setTimeout(() => {
        console.log(Array.from(document.getElementsByClassName("blackScreen")))
        Array.from(document.getElementsByClassName("blackScreen")).forEach((blackScreen) => {
            blackScreen.remove();
        });
    }, 3000);
    
}

function _createPuzzleCanvas(number, name, picarats){
    /* 
    Create a new puzzle canvas consisting on an UpperScreen with the 
    puzzle number and title, and a lower screen with the Picarats amount 
    */

    return new Promise(resolve => {

        /* Canvas */
        let canvas = document.createElement("div");
        canvas.className = "puzzleCanvas";
        
        /* Upper screeen */
        let upperScreen = _createUpperScreen(number, name);

        /* Lower screen */
        let lowerScreen = _createLowerScreen(picarats);

        /* Left buttons */
        let leftButtons = _createLeftButtons();
        lowerScreen.appendChild(leftButtons);

        /* Right button */
        let check = _createRightButton();
        lowerScreen.appendChild(check);

        canvas.appendChild(upperScreen);
        canvas.appendChild(lowerScreen);

        document.body.appendChild(canvas);

        setTimeout(() => {
            upperScreen.style.animation = "slideDown 1s ease-in-out forwards";
            lowerScreen.style.animation = "slideUp 1s ease-in-out forwards";
        }, 1000);

        resolve(canvas);

    });

}



function startPuzzle(number, name, picarats){

    _createPuzzleCanvas(number, name, picarats).then((canvas) => {

        canvas.querySelector("#lowerScreen").addEventListener("click", (event) => {
            _fadeScreen(canvas);

            setTimeout(() => {
                aSilentMelody(canvas);
            }, 1000);

        }, {once : true});
    });

}

function _001createImageElement(className, id){

    let image = document.createElement("img");
    image.className = className + "Img";
    image.id = id;
    image.src = chrome.extension.getURL("../images/puzzles/" + className + "/" + id + ".png");
    image.style.position = "absolute";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.visibility = "hidden";

    return image;

}

function _createRotateButton(images){

    let rotateButton = document.createElement("img");
    rotateButton.src = chrome.extension.getURL("../images/puzzles/puzzle001/rotateButton.png");
    rotateButton.className = "rotateButton";

    rotateButton.addEventListener("click", () => {
        let currentImage = images.find((image) => image.style.visibility == "visible");
        
        switch(currentImage.id){
            case "frontImage":
                images[0].style.visibility = "hidden";
                images[1].style.visibility = "visible";
                break;
            case "leftImage":
                images[1].style.visibility = "hidden";
                images[3].style.visibility = "visible";
                break;
            case "backImage":
                images[3].style.visibility = "hidden";
                images[2].style.visibility = "visible";
                break;
            case "rightImage":
                images[2].style.visibility = "hidden";
                images[0].style.visibility = "visible";
                break;
        }

        if(currentSelection!=null){
            currentSelection.remove();
            currentSelection = null;
        }
    });

    return rotateButton;
}

function _createSelection(){
    let selection = document.createElement("img");
    selection.src = chrome.extension.getURL("../images/puzzles/puzzle001/selection.png");
    selection.className = "selection";
    return selection;
}

let currentSelection = null;

function aSilentMelody(canvas){

    let upperScreen = canvas.querySelector("#upperScreen")
    let lowerScreen = canvas.querySelector("#lowerScreen")

    // LowerScreen

    let images = [
        _001createImageElement("puzzle001", "frontImage"),
        _001createImageElement("puzzle001", "leftImage"),
        _001createImageElement("puzzle001", "rightImage"),
        _001createImageElement("puzzle001", "backImage")
    ]

    images[0].style.visibility = "visible";
    images.forEach((image) => {
        lowerScreen.appendChild(image);

        image.addEventListener("click", (event) => {
            if (currentSelection!=null){
                currentSelection.remove();
            }
            currentSelection = _createSelection();
            currentSelection.style.left = event.offsetX - 12 + "px";
            currentSelection.style.top = event.offsetY - 12 + "px";
            lowerScreen.appendChild(currentSelection);
        });
    });

    // Create rotate button
    let rotateButton = _createRotateButton(images);
    lowerScreen.appendChild(rotateButton);
}

startPuzzle("PUZZLE 001", "A Silent Melody", "15 PICARATS");
//createPuzzleCanvas();