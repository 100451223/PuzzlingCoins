class Puzzle {
    constructor(number, puzzleHandler){
        this.number      = number;
        this.name        = "";
        this.picarats    = "";
        this.description = "";
        this.leftButtons = this._createLeftButtons();
        this.submitButton= this._createRightButton();
        this.upperScreen = null;
        this.lowerScreen = null;
        this.hintsButton = null;
        this.exitButton  = null;
        this.canvas      = null;
        this.puzzleObject= puzzleHandler;

        this.submitButton.addEventListener("click", this._submissionHandler);
    }

    _submissionHandler = () => {
        this._fadeScreen(true);

        if (this.puzzleObject.checkResult()){
            console.log("Correct!");
        } else {
            console.log("Incorrect!");
        }
    }   

    _getPuzzleInfo = async () => {

        let puzzleJSON;
        
        await fetch(chrome.runtime.getURL(`../scripts/puzzles/puzzle${this.number}.json`))
            .then(response => response.json())
            .then(jsonData => {
                puzzleJSON = jsonData;
        });

        this.name        = puzzleJSON["title"];
        this.picarats    = puzzleJSON["picarats"];
        this.description = puzzleJSON["description"];

        return puzzleJSON;
        
    }

    _createUpperScreen = () => {
        /* Create the upper screen of the puzzle canvas */
    
        let upperScreen = document.createElement("div");
        upperScreen.id = "upperScreen"
        upperScreen.className = "halfScreenFlex";
        upperScreen.style.backgroundImage = `url(${chrome.extension.getURL("../images/puzzles/PuzzleTitleBG.png")})`;
    
        let puzzleNumber = document.createElement("h1");
        puzzleNumber.className = "puzzleTitleNumber";
        puzzleNumber.innerHTML = this.number;
    
        let puzzleTitle = document.createElement("h3");
        puzzleTitle.className = "puzzleTitleNumber";
        puzzleTitle.innerHTML = this.name;
    
        upperScreen.appendChild(puzzleNumber);
        upperScreen.appendChild(puzzleTitle);
    
        return upperScreen;
    }

    _createLowerScreen = () => {
        /* Create the lower screen of the puzzle canvas */    
    
        let lowerScreen = document.createElement("div");
        lowerScreen.id = "lowerScreen"
        lowerScreen.className = "halfScreenFlex";
        lowerScreen.style.backgroundImage = `url(${chrome.extension.getURL("../images/puzzles/PuzzlePicaratsBG.png")})`;
    
        let picaratsCount = document.createElement("h1");
        picaratsCount.className = "puzzleTitleNumber";
        picaratsCount.id = "picaratsCount"
        picaratsCount.innerHTML = this.picarats;
    
        lowerScreen.appendChild(picaratsCount);
    
        return lowerScreen;
            
    }

    _createLeftButtons = () => {
        /* Create the left lower buttons: Hints and Exit, there shall be NO NOTES */
    
        let leftButtons = document.createElement("div");
        leftButtons.className = "leftButtons";
    
        let hintsButton = document.createElement("button");
        hintsButton.className = "puzzleButton";
        hintsButton.id = "hintsButton";
        hintsButton.innerHTML = "HINTS";
        this.hintsButton = hintsButton;
    
        let outButton = document.createElement("button");
        outButton.className = "puzzleButton";
        outButton.id = "outButton";
        outButton.innerHTML = "EXIT";
        this.exitButton = outButton;
    
        leftButtons.appendChild(hintsButton);
        leftButtons.appendChild(outButton);
    
        return leftButtons;
        
    }

    _createRightButton = () => {
        /* Create the right lower button: Check */
            
        let submitButton = document.createElement("button");
        submitButton.className = "rightButtons puzzleButton";
        submitButton.id = "submitButton";
        submitButton.innerHTML = "SUBMIT";
        this.submitButton = submitButton;
        
        return submitButton;
            
    }
    
    _createPuzzleCanvas = async () => {
        /* 
        Create a new puzzle canvas consisting on an UpperScreen with the 
        puzzle number and title, and a lower screen with the Picarats amount 
        */

        await this._getPuzzleInfo();

        this.upperScreen = this._createUpperScreen();
        this.lowerScreen = this._createLowerScreen();

        /* Canvas */
        let canvas = document.createElement("div");
        canvas.className = "puzzleCanvas";
        
        this.lowerScreen.appendChild(this.leftButtons);
        this.lowerScreen.appendChild(this.submitButton);

        canvas.appendChild(this.upperScreen);
        canvas.appendChild(this.lowerScreen);

        document.body.appendChild(canvas);
        this.canvas = canvas;

        setTimeout(() => {
            this.upperScreen.style.animation = "slideDown 1s ease-in-out forwards";
            this.lowerScreen.style.animation = "slideUp 1s ease-in-out forwards";
        }, 1000);
    
    }

    _showLowerButtons = () => {
        /* Show the lower buttons */

        
        document.getElementById("hintsButton").style.visibility = "visible";
        document.getElementById("outButton").style.visibility = "visible";
        this.submitButton.style.visibility = "visible";
    
    }

    _fadeScreen = (hold) => {
        /* This fades whatever is on BOTH the upper and lower screens */
        
        /* Dummy black screen */
        let blackScreen = document.createElement("img");
        blackScreen.src = chrome.extension.getURL("../images/blackScreen.png");
        
        blackScreen.className = "blackScreen";
    
        
        if (!hold){
            blackScreen.style.animation = "fadeOut 3s ease-in-out forwards";
            setTimeout(() => {
                Array.from(document.getElementsByClassName("blackScreen")).forEach((blackScreen) => {
                    blackScreen.remove();
                });
            }, 3000);
        } else {
            blackScreen.style.animation = "fadeIn 1.5s ease-in-out forwards";
        }
        
        this.lowerScreen.appendChild(blackScreen);
        this.upperScreen.appendChild(blackScreen.cloneNode(true));
    }

    _writePuzzleStatement = (puzzleStatementText) => {
        /* Show the puzzle statement */
    
        this.upperScreen.style.backgroundImage = `url(${chrome.extension.getURL("../images/puzzles/PuzzleDescriptionBackground.png")})`;
        this.upperScreen.style.backgroundSize = "cover";
        this.upperScreen.style.backgroundColor = "transparent";
    
        // Delete the puzzle title and number, but not the other things
        Array.from(this.upperScreen.children).forEach((child) => {
            if (child.className != "blackScreen"){
                child.remove();
            }
        });
    
    
        let puzzleStatement = document.createElement("p");
        puzzleStatement.className = "puzzleStatement";
    
        this.upperScreen.appendChild(puzzleStatement);
        writeText(puzzleStatementText, "puzzleStatement", false)
    
    }

    startPuzzle = async () => {

        this.canvas = await this._createPuzzleCanvas();
        

        this.lowerScreen.addEventListener("click", () => {
            this._fadeScreen(false);

            setTimeout(() => {
                this._writePuzzleStatement(this.description);

                this._showLowerButtons();
                this.puzzleObject.startPuzzle001(this.lowerScreen);
            }, 1000);

        }, {once : true});
    
    }
    

}

// PUZZLE 001

class ASilentMelody {

    constructor(){
        this.id = "001";
        this.lowerScreen = null;
        this.result = null;
        this.images = [
            this._001createImageElement("001", "frontImage"),
            this._001createImageElement("001", "leftImage"),
            this._001createImageElement("001", "rightImage"),
            this._001createImageElement("001", "backImage")
        ];
        this.rotateButton = this._createRotateButton();
        this.currentImage = null;
        this.currentSelection = null;

        this.rotateButton.addEventListener("click", this._rotateImage);
    }
    
    _001createImageElement(puzzleId, imageId) {
        // Create an image from puzzle #puzzleId with imageId as the source
    
        let image = document.createElement("img");
        image.className = `puzzle${puzzleId}Img`;
        image.id = imageId;
        image.src = chrome.extension.getURL("../images/puzzles/" + `puzzle${puzzleId}` + "/" + imageId + ".png");
        
        return image;
    
    }
    
    _createRotateButton = () => {
        // Create a rotate button to rotate the guitar
    
        let rotateButton = document.createElement("img");
        rotateButton.src = chrome.extension.getURL("../images/puzzles/puzzle001/rotateButton.png");
        rotateButton.className = "rotateButton";
        return rotateButton;
    }

    _rotateImage = () => {
        // Find the visible image and set it as the current one
        this.currentImage = this.images.find((image) => image.style.visibility == "visible");
        
        switch(this.currentImage.id){
            case "frontImage":
                this.images[0].style.visibility = "hidden";
                this.images[1].style.visibility = "visible";
                break;
            case "leftImage":
                this.images[1].style.visibility = "hidden";
                this.images[3].style.visibility = "visible";
                break;
            case "backImage":
                this.images[3].style.visibility = "hidden";
                this.images[2].style.visibility = "visible";
                break;
            case "rightImage":
                this.images[2].style.visibility = "hidden";
                this.images[0].style.visibility = "visible";
                break;
        }

        // Remove the selection circle if it exists
        if(this.currentSelection!=null){
            this.currentSelection.remove();
            this.currentSelection = null;
        }
    }

    _createSelection = () => {
        // Create a circle selection element 
    
        let selection = document.createElement("img");
        selection.src = chrome.extension.getURL("../images/puzzles/puzzle001/selection.png");
        selection.className = "selection";
        return selection;
    }

    _appendSelection = (event) => {
        // Append a selection circle to the lower screen

        if (this.currentSelection!=null) this.currentSelection.remove();

        this.currentSelection = this._createSelection();
        this.currentSelection.style.left = event.offsetX - 12 + "px";
        this.currentSelection.style.top = event.offsetY - 12 + "px";
        this.result = [event.offsetX, event.offsetY];
        
        this.lowerScreen.appendChild(this.currentSelection);
    }

    startPuzzle001 = (lowerScreen) => {

        this.lowerScreen = lowerScreen;
        // Set the first image (front view) as visible
        this.images[0].style.visibility = "visible";
        // Add the rotate button to the upper screen
        this.lowerScreen.appendChild(this.rotateButton);
        // Add the images to the lower screen
        this.images.forEach((image) => {
            // Add the image to the lower screen
            this.lowerScreen.appendChild(image);
            // Show the selection circle and save the result
            image.addEventListener("click", this._appendSelection);
        });
           
    }

    _checkResultRange = (userSubission, correctResult, offset) => {
        // Check if the user submit is in a correct range
        return userSubission<=(correctResult+offset) && userSubission>=(correctResult-offset)
    }

    checkResult = () => {
        return this._checkResultRange(this.result[0], 280, 10) && this._checkResultRange(this.result[1], 230, 10)
    }
}

// MAIN
asm = new ASilentMelody();
pzl = new Puzzle("001", asm);
pzl.startPuzzle();