let config = {
    "lang": "es"
}

class Puzzle {
    constructor(number, puzzleHandler){
        this.number         = number;
        this.name           = "";
        this.picarats       = "";
        this.description    = "";
        this.solution       = "";
        this.buttons        = {"hints": null, "exit": null, "submit": null}; 
        this.startMenu      = {"picarats": null, "title": null, "number": null};
        this.leftButtons    = this._createHintsExitButtons();
        this.submitButton   = this._createSubmitButton();
        this.blackScreen    = {"upper": null, "lower": null},
        this.deductionImg   = [];
        this.screens        = {"upperScreen": null, "lowerScreen": null}
        this.puzzleContainer= null;
        this.canvas         = null;
        this.puzzleObject   = puzzleHandler;
        this.puzzleAudio    = this._createPuzzleAudio();
        this.RightWrongImg  = this._createResultImages();

        this.submitButton.addEventListener("click", this._submissionHandler);
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
        this.startMenu.number = puzzleNumber;
        
        let puzzleTitle = document.createElement("h3");
        puzzleTitle.className = "puzzleTitleNumber";
        puzzleTitle.innerHTML = this.name;
        this.startMenu.title = puzzleTitle;
        
        upperScreen.appendChild(this.startMenu.number);
        upperScreen.appendChild(this.startMenu.title);
        
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

        this.startMenu.picarats = picaratsCount;
        
        lowerScreen.appendChild(this.startMenu.picarats);
        
        return lowerScreen;
        
    }

    _createHintsButton = () => {
        /* Create the hints button */

        let hintsButton = document.createElement("button");
        hintsButton.className = "puzzleButton";
        hintsButton.id = "hintsButton";
        hintsButton.innerHTML = "HINTS";

        return hintsButton;
    }
    
    _createExitButton = () => {
        /* Create the exit button */

        let exitButton = document.createElement("button");
        exitButton.className = "puzzleButton";
        exitButton.id = "outButton";
        exitButton.innerHTML = "EXIT";

        return exitButton;
    }

    _createHintsExitButtons = () => {
        /* Create the left lower buttons: Hints and Exit, there shall be NO NOTES */
        
        let leftButtons = document.createElement("div");
        leftButtons.className = "leftButtons";

        console.log(this._createHintsButton())
        this.buttons.hints = this._createHintsButton();
        this.buttons.exit = this._createExitButton();
        
        leftButtons.appendChild(this.buttons.hints);
        leftButtons.appendChild(this.buttons.exit);
        
        return leftButtons;
        
    }
    
    _createSubmitButton = () => {
        /* Create the right lower button: Check */
        
        let submitButton = document.createElement("button");
        submitButton.className = "rightButtons puzzleButton";
        submitButton.id = "submitButton";
        submitButton.innerHTML = "SUBMIT";
        this.buttons.submit = submitButton;

        return submitButton;
        
    }
    
    _createPuzzleCanvas = async () => {
        /* 
        Create a new puzzle canvas consisting on an UpperScreen with the 
        puzzle number and title, and a lower screen with the Picarats amount 
        */
       
       await this._getPuzzleInfo();
       
       this.screens.upperScreen = this._createUpperScreen();
       this.screens.lowerScreen = this._createLowerScreen();
       
       /* Canvas */
       let canvas = document.createElement("div");
       canvas.className = "puzzleCanvas";
       
       this.screens.lowerScreen.appendChild(this.leftButtons);
       this.screens.lowerScreen.appendChild(this.submitButton);
       
       canvas.appendChild(this.screens.upperScreen);
       canvas.appendChild(this.screens.lowerScreen);
       
       document.body.appendChild(canvas);
       this.canvas = canvas;
       
       setTimeout(() => {
           this.screens.upperScreen.style.animation = "slideDown 1s ease-in-out forwards";
           this.screens.lowerScreen.style.animation = "slideUp 1s ease-in-out forwards";
        }, 1000);
        
    }

    _createResultImages = () => {
        // Create the images for CORRECT! and INCORRECT! results

        let result = {"right": null, "wrong": null}   
        
        let right = document.createElement("img");
        right.src = chrome.extension.getURL(`../images/deduction/correct_${config.lang}.png`);
        right.className = "lowerScreenCover resultImg";

        let wrong = document.createElement("img");
        wrong.src = chrome.extension.getURL(`../images/deduction/incorrect_${config.lang}.png`);
        wrong.className = "lowerScreenCover resultImg";

        result.right = right;
        result.wrong = wrong;

        return result;
    }
    
    _createDeductionImages = (fate) => {
        // Create the deduction images. For right ot wrong answer, depending on 'fate'

        console.log("FATE", fate);
        for(let i=1; i<5; i++){
            let deductionImg = document.createElement("img");
            deductionImg.className = "lowerScreenCover deductionImg";
            let url = i>=3? `../images/deduction/deduction${i}_${fate}.png` : `../images/deduction/deduction${i}.png`;
            deductionImg.src = chrome.extension.getURL(url);
            this.deductionImg.push(deductionImg);
        }

    }

    _createPuzzleAudio = () => {
        /* Add an audio element to the page; it will only play the coin sound */
    
        let audio = document.createElement("audio");
        audio.id = "puzzle-audio";
        document.body.appendChild(audio);
        return audio
    }

    _displayResult = (fate) => {
        // Display the result of the puzzle: CORRECT! or INCORRECT!
        
        let useResultImage = fate == "right"? this.RightWrongImg.right : this.RightWrongImg.wrong;
        this.screens.upperScreen.appendChild(useResultImage);
    }

    _displayStartMenu = () => {
        this.startMenu.picarats.style.visibility = "visible";
        this.startMenu.title.style.visibility = "visible";
        this.startMenu.number.style.visibility = "visible";
    }

    _hideStartMenu = () => {
        this.startMenu.picarats.style.visibility = "hidden";
        this.startMenu.title.style.visibility = "hidden";
        this.startMenu.number.style.visibility = "hidden";
    }

    _displayPuzzleUI = () => {
        this.leftButtons.style.visibility = "visible";
        this.submitButton.style.visibility = "visible";
    }

    _hidePuzzleUI = () => {
        this.leftButtons.style.visibility = "hidden";
        this.submitButton.style.visibility = "hidden";
    }

    _playAudio = (fate) => {
        if (fate == "right"){
            this.puzzleAudio.src = chrome.runtime.getURL(`../audio/solvingJingles/puzzleSolved.mp3`);
            this.puzzleAudio.play();
        } 
        // else 
        // {
        //     this.puzzleAudio.src = chrome.runtime.getURL(`../audio/solvingJingles/puzzleNOTSolved.mp3`);
        //     this.puzzleAudio.play();
        // }
    }
    
    _displayDeductionImages = async (fate) => {

        return new Promise((resolve) => {

            // Create
            this._createDeductionImages(fate);
            this.deductionImg[0].style.animationDelay = "1s";
            
            //Play audio
            this._playAudio(fate);

            // Display
            let i = 0;
            const setImageListener = (image) => {
                this.screens.lowerScreen.appendChild(image);
                i++;
                image.addEventListener("animationend", () => {
                    // console.log(image)
                    this.screens.lowerScreen.removeChild(image);
                    if (i>=4) {
                        resolve();
                        return;
                    };
                    setImageListener(this.deductionImg[i]);
                });
            }
            
            // Start with the first image
            setImageListener(this.deductionImg[0]);
            // The last image is longer
            this.deductionImg[3].style.animation = "fadeOutLong 2s linear forwards";
        });
    }
    
    
    _displayFadeScreen = (hold) => {
        /* This fades whatever is on BOTH the upper and lower screens */
        
        /* Dummy black screen */
        let blackScreen = document.createElement("img");
        blackScreen.src = chrome.extension.getURL("../images/blackScreen.png");
        blackScreen.className = "blackScreen";

        // /* Fade in the black screen */
        blackScreen.style.animation = "simpleFadeIn 1s ease-in-out forwards"

        // Clone the black screen for the lower screen
        this.blackScreen.upper = blackScreen;
        this.blackScreen.lower = blackScreen.cloneNode(true);

        // If hold is true, the black screen will not fade out
        
        this.blackScreen.upper.addEventListener("animationend", () => {
            if(!hold){
                this.blackScreen.upper.style.animation = "simpleFadeOut 1s ease-in-out forwards";
                this.blackScreen.upper.addEventListener("animationend", () => {
                    this.blackScreen.upper.remove();
                });
            }
        });

        this.blackScreen.lower.addEventListener("animationend", () => {
            if(!hold){
                this.blackScreen.lower.style.animation = "simpleFadeOut 1s ease-in-out forwards";
                this.blackScreen.lower.addEventListener("animationend", () => {
                    this.blackScreen.lower.remove();
                });
            }
        });
                        
        this.screens.upperScreen.appendChild(this.blackScreen.upper);
        this.screens.lowerScreen.appendChild(this.blackScreen.lower);

    }

    _writePuzzleStatement = (puzzleStatementText) => {
        /* Show the puzzle statement */
    
        this.screens.upperScreen.style.backgroundImage = `url(${chrome.extension.getURL("../images/puzzles/PuzzleDescriptionBackground.png")})`;
        this.screens.upperScreen.style.backgroundSize = "cover";
        this.screens.upperScreen.style.backgroundColor = "transparent";
    
        // Delete the puzzle title and number, but not the other things
        Array.from(this.screens.upperScreen.children).forEach((child) => {
            if (child.className != "blackScreen"){
                child.remove();
            }
        });
    
        let puzzleStatement = document.createElement("p");
        puzzleStatement.className = "puzzleStatement";
    
        this.screens.upperScreen.appendChild(puzzleStatement);
        writeText(puzzleStatementText, "puzzleStatement", false)
    
    }

    _getPuzzleInfo = async () => {
        
        let puzzleJSON;
        
        await fetch(chrome.runtime.getURL(`../scripts/puzzles/puzzle${this.number}.json`))
        .then(response => response.json())
            .then(jsonData => {
                puzzleJSON = jsonData;
            });
            
            this.name        = puzzleJSON[`title_${config.lang}`];
            this.picarats    = puzzleJSON["picarats"];
            this.description = puzzleJSON[`description_${config.lang}`];
            this.solution    = puzzleJSON[`solution_${config.lang}`];
            
        return puzzleJSON;
            
    }

    startPuzzle = async () => {

        this.canvas = await this._createPuzzleCanvas();
        this._displayStartMenu();
        
        this.screens.lowerScreen.addEventListener("click", () => {
            setTimeout(() => this._hideStartMenu(), 1000)
            this._displayFadeScreen(false);

            setTimeout(() => {
                this._writePuzzleStatement(this.description);
                this._displayPuzzleUI();
                this._addPuzzleLogicContainer();
            }, 1000);

        }, {once : true});
    
    }

    _addPuzzleLogicContainer = () => {

        let puzzleContainer = document.createElement("div");
        puzzleContainer.className = "lowerScreenCover puzzleContainer";
        this.puzzleContainer = puzzleContainer;

        this.puzzleContainer.append(this.puzzleObject.startPuzzle001())
        this.screens.lowerScreen.appendChild(this.puzzleContainer);
    
    }

    _clearFadeScreen = () => {
        if(this.blackScreen.upper){
            this.blackScreen.upper.style.animation = "simpleFadeOut 3s ease-in-out forwards";
            this.blackScreen.upper.addEventListener("animationend", () => {
                this.blackScreen.upper.remove();
            });
        }

        if(this.blackScreen.lower){
            this.blackScreen.lower.style.animation = "simpleFadeOut 3s ease-in-out forwards";
            this.blackScreen.lower.addEventListener("animationend", () => {
                this.blackScreen.lower.remove();
            });
        }
    }

    _submissionHandler = () => {
        this._displayFadeScreen(true);

        this.blackScreen.lower.addEventListener("animationend", () => {
            this.puzzleContainer.remove();
        });
        
        if (this.puzzleObject.checkResult()){
            console.log("Correct!"); 
            this._displayDeductionImages("right").then(() => {
                this._hidePuzzleUI();
                this._displayResult("right");
                this._clearFadeScreen();
            });
            
        } else {
            console.log("Incorrect!"); 
            this._displayDeductionImages("wrong").then(() =>{
                this._hidePuzzleUI();
                this._displayResult("wrong");
                this._clearFadeScreen();
            });
        }
    }
    

}

// // MAIN
// asm = new ASilentMelody();

// pzl = new Puzzle("001", asm);

// pzl.startPuzzle();