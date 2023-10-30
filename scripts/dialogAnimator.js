class DialogAnimator{

    constructor(dialogBox){
        this.dialogBox = dialogBox;

        this.config = {
            "maxCharactersPerLine": 35,
            "maxSentencesPerBox": 3,
            "newBoxCharacter": "->",
            "emoteRegex": /<.*?>/g
        }

        this.animationFrame = null;
        this.isTalking = false;
        this.stopByFastTalk = false;
        this.currentText = "";
        this.fps = 30
    }

    _splitDialogueToComments = (text) => {
        /* Split the dialogue into n comments of m sentences. */

        let words = text.split(" ");
        let emotionalBuffer = [];

        let currentSentence = "";        
        let currentComment  = "";
        let lineCount = 0;
        let comments = [];

        for (let i = 0; i < words.length; i++)
        {
            
            // Force-end the current sentence with the previous word if the new box character is found
            if (words[i] == this.config.newBoxCharacter)
            {
                comments.push(currentComment.slice(0, -1));
                currentComment  = "";
                comments.push(currentSentence.slice(0, -1));
                currentSentence = "";
                lineCount = 0;
                continue;
            }

            // Change character's emotion
            if (words[i].match(this.config.emoteRegex) != null)
            {
                emotionalBuffer.push(words[i].slice(1, -1));
                continue;
            }

            // Separate the text into comments of #maxSentencesPerBox sentences 
            if (currentSentence.length + words[i].length + 1 >= this.config.maxCharactersPerLine)
            {
                currentComment += currentSentence;
                lineCount++;

                // If the current comment is full, append it to the comments array and reset the current comment
                if (lineCount >= this.config.maxSentencesPerBox)
                {
                    comments.push(currentComment.slice(0, -1));
                    lineCount = 0;
                    currentComment = "";

                    // If no emotion is stated, set it to idle
                    if(emotionalBuffer.length != comments.length) 
                        emotionalBuffer.push("idle");
                }

                currentSentence = "";                
            }

            currentSentence += words[i] + " ";
        }        

        // Append the last (incomplete) sentence as a comment, if there is one.
        if (currentSentence != "") comments.push(currentComment + currentSentence.slice(0, -1));
        if (emotionalBuffer.length != comments.length) emotionalBuffer.push("idle");

        return {comments: comments, emotions: emotionalBuffer}
    };

    resetAnimator = () => {
        /* Reset the animator to its initial state. */

        console.log("Resetting dialog animator");

        this.dialogBox.innerText = "";
        this.isTalking = false;
        this.stopByFastTalk = false;
        this.currentText = "";
        if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
        return
    }

    fastTalk = () => {
        /* Finish writing the current dialogue at once. */

        this.stopByFastTalk = true;
        this.dialogBox.innerText = this.currentText;
        this.isTalking = false;
    }

    animate = (text, callback) => {
        /* Animate the text by adding one character at a time every "mouthSpeed" miliseconds. */

        this.isTalking = true;
        this.currentText = text;

        this.dialogBox.innerText = "";
        let i = 0;

        const _animate = () => {
            
            setTimeout(() => {

                if (i >= text.length || this.stopByFastTalk)
                {   
                    window.cancelAnimationFrame(this.animationFrame);
                    this.isTalking = false;
                    this.stopByFastTalk = false;
                    this.currentText = "";
                    if (callback) 
                        callback();
                    return;
                }

                this.dialogBox.innerText += text[i];
                i++;

                this.animationFrame = window.requestAnimationFrame(_animate);
            }, 1000/this.fps);
        }

        _animate();

    }

}