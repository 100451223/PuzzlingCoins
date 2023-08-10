class DialogueAnimator{

    constructor(dialogBox){
        this.dialogBox = dialogBox;

        this.config = {
            "maxCharactersPerLine": 35,
            "maxSentencesPerBox": 3,
            "newBoxCharacter": "->",
            "emoteRegex": /<.*?>/g
        }

    }

    _splitDialogueToSentences = (text) => {
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
                        emotionalBuffer.push("idle");
                }

                currentSentence = "";                
            }

            currentSentence += words[i] + " ";
        }


        // Append the last (incomplete) sentence as a comment, if there is one.
        if (currentSentence != "") comments.push(currentSentence.slice(0, -1));
        if (emotionalBuffer.length != comments.length) emotionalBuffer.push("idle");

        console.log(comments)
        console.log(emotionalBuffer)
        return comments;
            
    }
}

let test = new DialogueAnimator("dialogBox")

test._splitDialogueToSentences("My name is Ether Netts, and I'm an <angry> archeology student at Gressenheller University. -> Not to brag, but my tutor is the famous Professor Hershel Layton, I asume you know exactly who I'm talking about. <sad>")