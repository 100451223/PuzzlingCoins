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
        this.talking = false;
        this.stop = false;
        this.fps = 30
    }

    _splitDialogueToComments = (text) => {
        /* Split the dialogue into sentences and append them to the sentences array. */

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
                emotionalBuffer.push(words[i]);
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
                        emotionalBuffer.push("<idle>");
                }

                currentSentence = "";                
            }

            currentSentence += words[i] + " ";
        }


        // Append the last (incomplete) sentence as a comment, if there is one.
        if (currentSentence != "") comments.push(currentSentence.slice(0, -1));
        if (emotionalBuffer.length != comments.length) emotionalBuffer.push("<idle>");

        return comments;
            
    }

    _animateText(text) {
        /* Animate the text by adding one character at a time every "mouthSpeed" miliseconds. */

        this.dialogBox.innerText = "";
        let i = 0;

        const _animate = () => {
            
            setTimeout(() => {

                if (i >= text.length || this.stop){
                    window.cancelAnimationFrame(this.animationFrame);
                    return;
                }

                this.dialogBox.innerText += text[i];
                i++;

                this.animationFrame = window.requestAnimationFrame(_animate);
            }, 1000/this.fps);
        }

        _animate();

    }


    showDialog = (text) => {
        /* Show the dialogue in the dialog box. */

        let comments = this._splitDialogueToComments(text);
        console.log(comments);

        const _showNextComment = () => this._animateText(comments.shift(), 50);

        this._animateText(comments.shift(), 50);
        
        this.dialogBox.addEventListener("click", _showNextComment);
    }
}