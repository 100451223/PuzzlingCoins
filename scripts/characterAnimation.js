let talkIntervalId = null;

function talk(mouthSpeed, talkTime){
    let characterSprite = document.getElementsByClassName("characterContainer")[0];
    talkIntervalId = setInterval(function(){
        if (characterSprite.children[1].src.includes("ClosedMouth")){
            characterSprite.children[1].src = characterSprite.children[1].src.replace("ClosedMouth", "OpenMouth");
        } else {
            characterSprite.children[1].src = characterSprite.children[1].src.replace("OpenMouth", "ClosedMouth");
        }
    }, mouthSpeed);
    setTimeout(function(){
        if(talkIntervalId != null)
            clearInterval(talkIntervalId);
        talkIntervalId = null;
        if (characterSprite.children[1].src.includes("OpenMouth")){
            characterSprite.children[1].src = characterSprite.children[1].src.replace("OpenMouth", "ClosedMouth");
        }
    }, talkTime);
}


function createCharacterSprite(character, text){
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

    characterImage.src = chrome.extension.getURL(`../images/characters/${character}/${character}_ClosedMouth.png`);
    
    

    dialogueBox.appendChild(characterName);
    dialogueBox.appendChild(dialogueText);
    dialogueBox.appendChild(dialogueBoxImage);
    characterContainer.appendChild(dialogueBox);
    characterContainer.appendChild(characterImage);

    document.body.append(characterContainer);
}
//createCharacterSprite("ether", "My name is Ether Netts, and I am a student at Gressenheller University. Professor Hershel Layton is my archaeology teacher.");

/* To fit de dialogue box */
const maxWordsPerComment = 20;
let comments = [];
let currentComment = 0;
let maxCharactersPerComment = 120;
let currentlyWritingText = false;
fastWrite = false;

function showDialogue(character, position, text){

    let textWords = text.split(" ");

    let currentComment = 0;
    let currentCommentLen = 0;
    let currentComentWords = [];

    for (let i = 0; i < textWords.length; i++){
        if (currentCommentLen + textWords[i].length < maxCharactersPerComment && i!=textWords.length-1 && textWords[i] != "->"){
            currentCommentLen += textWords[i].length;
            currentComentWords.push(textWords[i]);
        } else {
            if (i==textWords.length-1){
                currentComentWords.push(textWords[i]);
            }
            
            comments.push(currentComentWords.join(" "));
            if(textWords[i] == "->"){
                currentCommentLen = 0;
                currentComentWords = [];
            } else {
                currentComentWords = [textWords[i]];
                currentCommentLen = textWords[i].length;
            }
        }
    }

    console.log(comments);

    // Show the first comment
    createCharacterSprite(character, comments[0]);
    writeText(comments[0]);
    if(talkIntervalId != null){
        clearInterval(talkIntervalId);
        talkIntervalId = null;
    }
    talk(150, 3500);
    currentComment++;
    //createCharacterSprite(character, text);

    document.getElementsByClassName("dialogueBox")[0].addEventListener("click", function(){
        if (currentComment != comments.length || currentlyWritingText){

            if(currentlyWritingText){
                fastWrite = true;
            } else {
                currentComment++;
                writeText(comments[currentComment-1]);
                if(talkIntervalId != null){
                    clearInterval(talkIntervalId);
                    talkIntervalId = null;
                }
                talk(150, 3500);
            }

            
        } else {
            
            document.getElementsByClassName("characterContainer")[0].remove();
            currentComment = 0;
            comments = [];
        }
    });

}

function writeText(text){

    let textBox = document.getElementsByClassName("dialogueText")[0];
    let currentlyAt = 0;
    currentlyWritingText = true;

    let animationFrame = null;
    let frameCount = 0; 
    const FPS = 20; /* Objective FPS  frequency */

    function animate() {

        if (!frameCount) {
            textBox.innerText = text.slice(0, currentlyAt);
            currentlyAt++;
            console.log("currentlyAt: ", currentlyAt);

            if (currentlyAt > text.length || !currentlyWritingText) {
                currentlyWritingText = false;
                window.cancelAnimationFrame(animationFrame);
                return;
            }

            if (fastWrite){
                currentlyWritingText = false;
                window.cancelAnimationFrame(animationFrame);
                textBox.innerText = text;
                fastWrite = false;
                return;
            }
        }

        frameCount = (frameCount + 1) % (60 / FPS);
        animationFrame = window.requestAnimationFrame(animate);

        /* 
        
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

showDialogue("ether", "left", "Hello there! Nice to meet you. -> My name is Ether Netts, and I am a student at Gressenheller University. Professor Hershel Layton is my archaeology teacher. Although to be fair, he doesn't show up to class all that much... The thing is, last time he came by I suggested a theme for my homework about 'Digital Archaeology', and he seemed to be into it, so we decided to work together on it. Of course, I'll be leading the analysis since he's probably out there dealing with deadly reliqs, time travel or ancient civilizations. You know how he is, he can't leave any puzzle unsolved. -> Anyway, he might pop up sometime with a puzzle or something.")