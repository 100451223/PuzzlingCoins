class CharacterManager{
    
    constructor(character){
        this.character = character;
        this.showing = true;
        
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
        
        // Dialogue variables
        this.comments = [];
        this.emotionalBuffer = [];
        this.next_dialogue_callback = null;
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

    _showCharacterSprite = () => {
        /* Show the character sprite */

        this.characterElem.style.animation = "appear 1s forwards";
        this.showing = true;
    }

    shutUp = () => {
        /* Shuts the character up */
        
        this.spriteAnimator.cancelAnimation();

        // Force mouth to close
        if (this.characterSpriteImg.src.includes("OpenMouth"))
            this.characterSpriteImg.src = this.characterSpriteImg.src.replace("OpenMouth", "ClosedMouth")
        return;
    }

    _talkSingleSentence = (text, emotion) => {
        /* Animate only ONE comment defined by the comment's text and emotions */

        let sprites = [this.sprites.path + emotion +"_ClosedMouth.png", this.sprites.path + emotion +"_OpenMouth.png"]

        this.spriteAnimator.animate(this.characterSpriteImg, sprites, true);
        this.dialogAnimator.animate(text, this.shutUp);

        return;
    }

    _textbox_click_handler = (next_dialogue_callback) => {
        /* Handle click on text box: fast talk, show next comment or finish dialogue */

        // If the character is talking, finish writing the sentence and stop
        if (this.dialogAnimator.isTalking){
            return this.dialogAnimator.fastTalk();
        } else {
            if (this.comments.length == 0)
                // If there are no more comments, remove the character sprite
                return this._removeCharacterSprite(next_dialogue_callback);
            else
                // If there are more comments, show the next one
                return this._talkSingleSentence(this.comments.shift(), this.emotionalBuffer.shift())
        }   
    }

    talk = (text, next_dialogue_callback = null) => {
        /* Given a long text, split it into multiple comments and animate a dialogue. 
        When finished, start a new dialogue if specified by next_dialogue_callback */

        // If the character is not showing, show it
        if (!this.showing)
            this._showCharacterSprite();
    
        // Split the text into comments and emotions
        let speech = this.dialogAnimator._splitDialogueToComments(text);
        this.comments = speech.comments;
        this.emotionalBuffer = speech.emotions;

        // Display only the first comment from the dialogue
        this._talkSingleSentence(this.comments.shift(), this.emotionalBuffer.shift());

        // Add the click handler to the text box
        this.next_dialogue_callback =  () => this._textbox_click_handler(next_dialogue_callback);
        this.textBox.addEventListener("click", this.next_dialogue_callback);
        
        return
    }

    _removeCharacterSprite = (next_dialogue_callback) => {
        /* Hide the character sprite the body. Then, start a new dialogue if specified on next_dialogue_callback */

        this.characterElem.style.animation = "dissapear 1s forwards";
        this.textBox.removeEventListener("click", this.next_dialogue_callback);
        this.next_dialogue_callback = null;
        this.showing = false;


        this.characterElem.addEventListener("animationend", () => {
            // When hiding animation is complete, reset the animators and start a new dialogue if specified
            this.dialogAnimator.resetAnimator();
            this.spriteAnimator.resetAnimator();

            if (next_dialogue_callback != null) 
                return next_dialogue_callback();
            return
        }, { once: true });
        return;
    }
    
}


/* TEST EXAMPLE */


let ether = new CharacterManager("ether");

let dialog1 = "Hey! Hello there! Can you hear (or maybe read) me? My name is Ether Netts, and I'm an archeology student at Gressenheller University. Not to brag, but my tutor is the famous Professor Hershel Layton, I asume you know exactly who I'm talking about, hehe."
let dialog2 = "What? <sigh> Why am I here? Ah, it's because you solved *the* puzzle! You know, I spent so much time crafting it in hopes of finding someone smart enough to solve it... and you did! That's why... I NEED YOUR HELP!"
let dialog3 = "What I'm about to tell you is very important. The fate of the world is at stake here! So, I need to know beforehand...  you, who solved the second hardest puzzle in the world, would you like to help solve the #1 biggest puzzle in the world... The truth about the Internet!"

let callback2 = () => {
    console.log("Start 3")
    ether.talk(dialog3, null);
}

let callback = () => {
    console.log("Start 2")
    ether.talk(dialog2, callback2);
}

ether.talk(dialog1, callback);









