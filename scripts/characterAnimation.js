/* Global Variables */

const maxCharactersPerLine = 35; // these are actually 36 characters + 1 space
let dialogueShowing = false;
let comments = [];
let currentComment = 0;
let currentlyWritingText = false;
let fastWrite = false;
let talkIntervalId = null;
let emotionsBuffer = [];
const regex = /<.*?>/g;

/* Functions */

function createCharacterSprite(character){
    /* create a character sprite for "character" with a dialogue box containing "text" 

    Sprite Structure:

    | characterContainer
    |   | dialogueBox
    |   |   | characterName
    |   |   | dialogueText
    |   |   | dialogueBoxImage
    |   | characterImage

    */

    let characterContainer = document.createElement("div");
    characterContainer.className = "characterContainer";
    
    let dialogueBox = document.createElement("div");
    dialogueBox.className = "dialogueBox";

    let characterName = document.createElement("p");
    characterName.className = "characterName";
    characterName.innerText = character[0].toUpperCase() + character.slice(1);

    let dialogueText = document.createElement("p");
    dialogueText.className = "dialogueText";
    dialogueText.innerText = "";

    let dialogueBoxImage = document.createElement("img");
    dialogueBoxImage.className = "dialogueBoxImage";
    dialogueBoxImage.src = chrome.extension.getURL(`../images/dialogueBox.png`);

    let characterImage = document.createElement("img");
    characterImage.className = "characterImage";

    characterImage.src = chrome.extension.getURL(`../images/characters/${character}/idle_ClosedMouth.png`);
    
    dialogueBox.appendChild(characterName);
    dialogueBox.appendChild(dialogueText);
    dialogueBox.appendChild(dialogueBoxImage);
    characterContainer.appendChild(dialogueBox);
    characterContainer.appendChild(characterImage);

    document.body.append(characterContainer);
}

/* Talk animations */

function talk(mouthSpeed, talkTime){
    /* Makes the character talk by changing the mouth image every "mouthSpeed" miliseconds for "talkTime" miliseconds.*/

    let emotion;
    if (emotionsBuffer.length == 0){
        emotion = "idle";
    } else {
        emotion = emotionsBuffer.shift();
    }

    let characterSprite = document.getElementsByClassName("characterContainer")[0];
    let pathToSprite = characterSprite.children[1].src.split("/").slice(0, -1).join("/") + "/";
    
    talkIntervalId = setInterval(function(){
        if (characterSprite.children[1].src.includes("ClosedMouth")){
            characterSprite.children[1].src = pathToSprite + emotion +"_OpenMouth.png";
        } else {
            characterSprite.children[1].src = pathToSprite + emotion +"_ClosedMouth.png";
        }
    }, mouthSpeed);

    /* Shut the character up */
}

function shutTheCharacterUp(){
    /* Shuts the character up */

    let characterSprite = document.getElementsByClassName("characterContainer")[0];

    if(talkIntervalId != null)
        clearInterval(talkIntervalId);
    talkIntervalId = null;
    if (characterSprite.children[1].src.includes("OpenMouth")){
        characterSprite.children[1].src = characterSprite.children[1].src.replace("OpenMouth", "ClosedMouth")
    }

}

/* Text processing and writing */

function divideComment(text){

    let comments = [];
    let textWords = text.split(" ");

    let currentComentWords = [];
    let currentLineLen = 0;
    let currentLine = 0;

    for(let i=0; i<textWords.length; i++){

        if(i == textWords.length-1){
            if(currentLineLen + (textWords[i].length+1) <= maxCharactersPerLine){
                currentComentWords.push(textWords[i]);
                comments.push(currentComentWords.join(" "));
                continue;
            } else {
                currentLine++;
                comments.push(currentComentWords.join(" "));
                comments.push(textWords[i]);
                continue;
            }
        } 
        
        if(currentLineLen + (textWords[i].length+1) <= maxCharactersPerLine || textWords[i] == "->" || textWords[i].match(regex) != null ){

            if(textWords[i] != "->"){
                currentComentWords.push(textWords[i]);
                if(textWords[i].match(regex) == null){
                    currentLineLen += textWords[i].length+1;  // Word and space
                }
            } else {
                comments.push(currentComentWords.join(" "));
                currentComentWords = [];
                currentLine = 0;
                currentLineLen = 0;
            }
            
            if(i == textWords.length-1){
                comments.push(currentComentWords.join(" "));
            }

        } else {
            currentLine++;
            
            if(currentLine > 2){
                comments.push(currentComentWords.join(" "));
                currentComentWords = [textWords[i]];
                currentLine = 0;
                currentLineLen = textWords[i].length+1;
            } else {
                if(i == textWords.length-1){
                    comments.push(currentComentWords.join(" "));
                }
                currentComentWords.push(textWords[i]);
                currentLineLen = textWords[i].length+1;
            }
        }
    }

    for(let i = 0; i < comments.length; i++){
        let emotionsInComment = comments[i].match(regex);
        if (emotionsInComment != null){
            emotionsBuffer.push(emotionsInComment.slice(-1)[0].slice(1, -1));
            for (let j = 0; j < emotionsInComment.length; j++){
                comments[i] = comments[i].replace(emotionsInComment[j], "");
            }
        } else {
            emotionsBuffer.push("idle");
        }
    }


    return comments;
        
}

function writeText(text, textBoxElementClass, isCharacter=true){
    /* Writes the text "text" in the dialogue box */

    let textBox = document.getElementsByClassName(textBoxElementClass)[0];
    let currentlyAt = 0;
    currentlyWritingText = true;

    let animationFrame = null;
    let frameCount = 0; 
    const FPS = 30; /* Objective FPS  frequency */

    function animate() {
        /* This function is called every frame, it """writes a character at the time""" */

        if (!frameCount) {
            textBox.innerText = text.slice(0, currentlyAt);
            currentlyAt++;

            if (currentlyAt > text.length || !currentlyWritingText) {
                currentlyWritingText = false;
                if(isCharacter){
                    shutTheCharacterUp();
                }
                window.cancelAnimationFrame(animationFrame);
                return;
            }

            if (fastWrite){
                currentlyWritingText = false;
                if(isCharacter){
                    shutTheCharacterUp();         
                }
                window.cancelAnimationFrame(animationFrame);
                textBox.innerText = text;
                fastWrite = false;
                return;
            }
        }

        frameCount = (frameCount + 1) % (60 / FPS);
        animationFrame = window.requestAnimationFrame(animate);

        /* Explanation of requestAnimationFrame:

        Ok, so this is how it works:
        
        First, the function Animate is declared withing the writeText function. After being declared, it has to be called,
        so we ask the browser for a new animation frame. 

        The, after calling animate once, to keep writing, we need to call it again to keep writing, so we need to ask the 
        browser for a new animation frame. Thus, we call it recursively until: a.) the text is fully written, or b.) the user
        clicks the dialogue box, and the rest of the text is written immediatly. If any of these two conditions are met, the
        function returns all the way back, and the animation frame is cancelled.

        Also, setting the frameCount to 0, and then incrementing it every time the function is called, we can control the
        frequency of the animation. The new characters are written every 60/20 = 3 frames.

        The previous version of this function was using a setInterval, but due to every browser being stupid and limiting 
        setInterval to 1000ms when the tab is not active (or focused), it was changed to use requestAnimationFrame instead.

        */

    }

    animationFrame = window.requestAnimationFrame(animate);

}

/* On-screen representation */

function showDialogue(character, position, text){
    /* 
    Shows a dialogue box with the character "character" in the position "position" with the text "text" 
    Returns a promise so that dialogues can be chained.
    */

    return new Promise(resolve => {
        dialogueShowing = true;
        // Split the dialogue 
        comments = divideComment(text);

        // Create the sprite and write the first comment right away
        createCharacterSprite(character, comments[0]);
        writeText(comments[0], "dialogueText");
        if(talkIntervalId != null){
            clearInterval(talkIntervalId);
            talkIntervalId = null;
        }
        talk(150, 3500);
        currentComment++;

        document.getElementsByClassName("dialogueBox")[0].addEventListener("click", function(){
            if (currentComment != comments.length || currentlyWritingText){

                if(currentlyWritingText){
                    fastWrite = true;
                } else {
                    currentComment++;
                    writeText(comments[currentComment-1], "dialogueText");
                    if(talkIntervalId != null){
                        clearInterval(talkIntervalId);
                        talkIntervalId = null;
                    }
                    // select a random element from an array

                    talk(150, 3500);
                }            
            } else {
                let characterContainer = document.getElementsByClassName("characterContainer")[0];
                characterContainer.style.animation = "dissapear 1s";
                setTimeout(function(){
                    characterContainer.remove();
                    dialogueShowing = false;
                    resolve();
                }, 900);

                currentComment = 0;
                comments = [];
            }
        });
    });

}

// let dialog1 = ["ether", "left", "Hey! Hello there! Can you hear (or maybe read) me? -> My name is Ether Netts, and I'm an archeology student at Gressenheller University. Not to brag, but my tutor is the famous Professor Hershel Layton, I asume you know exactly who I'm talking about, hehe."]
// let dialog2 = ["ether", "left", "What? <sigh> Why am I here? Ah, it's because you solved *the* puzzle! -> You know, I spent so much time crafting it in hopes of finding someone smart enough to solve it... and you did! That's why... I NEED YOUR HELP!"]
// let dialog3 = ["ether", "left", "What I'm about to tell you is very important. -> The fate of the world is at stake here! So, I need to know beforehand... -> you, who solved the second hardest puzzle in the world, would you like to help solve the #1 biggest puzzle in the world... The truth about the Internet!"]

let dialog1 = ["ether", "left", "HEY! YOU, RANDOM INTERNET USER! Solve this puzzle! <angry> -> What do you mean *why*? <sigh> -> <idle> I am looking of a person capable of facing the hardest, toughest, most despair-inducing puzzles to unravel the biggest mystery in recent history! -> So, are you up to the challenge?"]

/* This is the dialogue structure, IF you don't like it I COULDN'T CARE LESS */

// showDialogue(...dialog1).then(() => {
//     showDialogue(...dialog2).then(() => {
//         showDialogue(...dialog3).then(() => {
//             asm = new ASilentMelody();
//             pzl = new Puzzle("001", asm);
//             pzl.startPuzzle();
//         })
//     })
// })

showDialogue(...dialog1).then(() => {
    asm = new ASilentMelody();
    pzl = new Puzzle("001", asm);
    pzl.startPuzzle();
})
