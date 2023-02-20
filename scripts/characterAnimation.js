function talk(mouthSpeed, talkTime){
    let characterSprite = document.getElementsByClassName("characterContainer")[0];
    let interval = setInterval(function(){
        if (characterSprite.children[1].src.includes("ClosedMouth")){
            characterSprite.children[1].src = characterSprite.children[1].src.replace("ClosedMouth", "OpenMouth");
        } else {
            characterSprite.children[1].src = characterSprite.children[1].src.replace("OpenMouth", "ClosedMouth");
        }
    }, mouthSpeed);
    setTimeout(function(){
        clearInterval(interval);
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
    dialogueText.innerText = text;

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

function showDialogue(character, position, text){

    let textWords = text.split(" ");
    
    for(let i=0; i<textWords.length; i+=maxWordsPerComment){
        let comment = textWords.slice(i, i+maxWordsPerComment).join(" ");
        comments.push(comment);
    }

    // Show the first comment
    createCharacterSprite(character, comments[0]);
    talk(150, 3500);
    currentComment++;
    //createCharacterSprite(character, text);

    document.getElementsByClassName("dialogueBox")[0].addEventListener("click", function(){
        if (currentComment != comments.length){
            currentComment++;
            document.getElementsByClassName("dialogueText")[0].innerText = comments[currentComment-1];
            talk(150, 3500);
        } else {
            document.getElementsByClassName("characterContainer")[0].remove();
            currentComment = 0;
            comments = [];
        }
    });

}

showDialogue("ether", "left", "My name is Ether Netts, and I am a student at Gressenheller University. Professor Hershel Layton is my archaeology teacher. Although to be fair, he doesn't show up to class all that much...")