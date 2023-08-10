class CharacterManager{
    
    constructor(character){
        this.character = character;
        
        // Img paths
        this.dialogBoxImgSrc = `../images/dialogueBox.png`;
        this.sprites = {
            initial: `../images/characters/${character}/idle_ClosedMouth.png`,
            path: `../images/characters/${character}/`,
        }
        
        // Character HTML elements
        this.textBox;
        this.characterElem = this._createCharacterSprite(character);
        this.characterSpriteImg = this.characterElem.children[1];
        
        // Character animation variables

        this.spriteAnimator = new SpriteAnimator(8);
        this.dialogAnimator = new DialogAnimator(this.textBox);
        
        
        this.emotionalBuffer = [];
    }

    _createCharacterSprite = () => {
        /* Create a character + dialogue box sprite and append it to the body.
    
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
        characterName.innerText = this.character[0].toUpperCase() + this.character.slice(1);
    
        let dialogueText = document.createElement("p");
        dialogueText.className = "dialogueText";
        dialogueText.innerText = "";
        this.textBox = dialogueText;
    
        let dialogueBoxImage = document.createElement("img");
        dialogueBoxImage.className = "dialogueBoxImage";
        dialogueBoxImage.src = chrome.extension.getURL(this.dialogBoxImgSrc);
    
        let characterImage = document.createElement("img");
        characterImage.className = "characterImage";
    
        characterImage.src = chrome.extension.getURL(this.sprites["initial"]);
        
        dialogueBox.appendChild(characterName);
        dialogueBox.appendChild(dialogueText);
        dialogueBox.appendChild(dialogueBoxImage);
        characterContainer.appendChild(dialogueBox);
        characterContainer.appendChild(characterImage);
    
        document.body.append(characterContainer);
    
        return characterContainer;
    }
    

    talk = (mouthSpeed, text) => {
        /* Makes the character talk by changing the mouth image every "mouthSpeed" miliseconds for "talkTime" miliseconds.*/
    
        let emotion = this.emotionalBuffer.length == 0? "idle" : this.emotionalBuffer.shift();

        let sprites = [this.sprites.path + emotion +"_ClosedMouth.png", this.sprites.path + emotion +"_OpenMouth.png"]

        // this.spriteAnimator.animate(this.characterSpriteImg, sprites, mouthSpeed, true);
        this.dialogAnimator.showDialog(text);
        
    }

    shutUp = () => {
        /* Shuts the character up */
        
        this.spriteAnimator.cancelAnimation();

        // Force mouth to close
        if (this.characterSpriteImg.src.includes("OpenMouth"))
            this.characterSpriteImg.src = this.characterSpriteImg.src.replace("OpenMouth", "ClosedMouth")
        
    
    }
}

let ether = new CharacterManager("ether");
ether.talk(150, "My name is Ether Netts, and I'm an <angry> archeology student at Gressenheller University. Not to brag, but my tutor is the famous Professor Hershel Layton, I asume you know exactly who I'm talking about. <sad>");
setTimeout(() => {
    console.log("shutting up")
    ether.shutUp();
}, 3000);