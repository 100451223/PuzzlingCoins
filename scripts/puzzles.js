class Puzzle {
    constructor(number, puzzleHandler){
        this.number      = number;
        this.name        = "";
        this.picarats    = "";
        this.description = "";
        this.leftButtons = this._createLeftButtons();
        this.submitButton= this._createRightButton();
        this.deductionImg= [];
        this.upperScreen = null;
        this.lowerScreen = null;
        this.hintsButton = null;
        this.exitButton  = null;
        this.canvas      = null;
        this.puzzleObject= puzzleHandler;
        this.puzzleAudio = this.addPuzzleAudio();;

        this.submitButton.addEventListener("click", this._submissionHandler);
    }

    _displayDeductionImages = (fate) => {

        // Create
        for(let i=1; i<5; i++){
            let deductionImg = document.createElement("img");
            deductionImg.className = "deductionImg";
            let url = i>=3? `../images/deduction/deduction${i}_${fate}.png` : `../images/deduction/deduction${i}.png`;
            deductionImg.src = chrome.extension.getURL(url);
            this.deductionImg.push(deductionImg);
        }
        this.deductionImg[0].style.animationDelay = "1s";
        
        if (fate == "right"){
            this.puzzleAudio.src = chrome.runtime.getURL(`../audio/solvingJingles/puzzleSolved.mp3`);
            this.puzzleAudio.play();
        }
        // Display
        let i = 0;
        const setImageListener = (image) => {
            this.lowerScreen.appendChild(image);
            i++;
            image.addEventListener("animationend", () => {
                this.lowerScreen.removeChild(image);
                if (i>=4) return;
                setImageListener(this.deductionImg[i]);
            });
        }

        setImageListener(this.deductionImg[0]);
        this.deductionImg[3].style.animation = "fadeOutLong 2s linear forwards";

    }

    _submissionHandler = () => {
        const fadeScreen = this._fadeScreen(true);

        if (this.puzzleObject.checkResult()){
            fadeScreen.addEventListener("animationend", () => {
                console.log("Correct!"); 
                this._displayDeductionImages("right");
            });
        } else {
            fadeScreen.addEventListener("animationend", () => {
                console.log("Correct!"); 
                this._displayDeductionImages("wrong");
            });
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

        return blackScreen;
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

    addPuzzleAudio = () => {
        /* Add an audio element to the page; it will only play the coin sound */
    
        let audio = document.createElement("audio");
        audio.id = "puzzle-audio";
        document.body.appendChild(audio);
        return audio
    }
    

}

// MAIN
asm = new ASilentMelody();

pzl = new Puzzle("001", asm);

pzl.startPuzzle();