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
let maxCharactersPerComment = 120;

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
    if(talkIntervalId != null){
        clearInterval(talkIntervalId);
        talkIntervalId = null;
    }
    talk(150, 3500);
    currentComment++;
    //createCharacterSprite(character, text);

    document.getElementsByClassName("dialogueBox")[0].addEventListener("click", function(){
        if (currentComment != comments.length){
            currentComment++;
            document.getElementsByClassName("dialogueText")[0].innerText = comments[currentComment-1];
            if(talkIntervalId != null){
                clearInterval(talkIntervalId);
                talkIntervalId = null;
            }
            talk(150, 3500);
        } else {
            document.getElementsByClassName("characterContainer")[0].remove();
            currentComment = 0;
            comments = [];
        }
    });

}

showDialogue("ether", "left", "Hello there! Nice to meet you. -> My name is Ether Netts, and I am a student at Gressenheller University. Professor Hershel Layton is my archaeology teacher. Although to be fair, he doesn't show up to class all that much... The thing is, last time he came by I suggested a theme for my homework about 'Digital Archaeology', and he seemed to be into it, so we decided to work together on it. Of course, I'll be leading the analysis since he's probably out there dealing with deadly reliqs, time travel or ancient civilizations. You know how he is, he can't leave any puzzle unsolved. -> Anyway, he might pop up sometime with a puzzle or something.")