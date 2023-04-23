class ASilentMelody {

    constructor(){
        this.id = "001";
        this.lowerScreen = null;
        this.result = null;
        this.images = [
            this._001createImageElement("001", "frontImage"),
            this._001createImageElement("001", "leftImage"),
            this._001createImageElement("001", "rightImage"),
            this._001createImageElement("001", "backImage")
        ];
        this.rotateButton = this._createRotateButton();
        this.currentImage = null;
        this.currentSelection = null;

        this.rotateButton.addEventListener("click", this._rotateGuitar);
    }
    
    _001createImageElement(puzzleId, imageId) {
        // Create an image from puzzle #puzzleId with imageId as the source
    
        let image = document.createElement("img");
        image.className = `puzzle${puzzleId}Img`;
        image.id = imageId;
        image.src = chrome.extension.getURL("../images/puzzles/" + `puzzle${puzzleId}` + "/" + imageId + ".png");
        
        return image;
    
    }
    
    _createRotateButton = () => {
        // Create a rotate button to rotate the guitar
    
        let rotateButton = document.createElement("img");
        rotateButton.src = chrome.extension.getURL("../images/puzzles/puzzle001/rotateButton.png");
        rotateButton.className = "rotateButton";
        return rotateButton;
    }

    _rotateGuitar = () => {
        // Find the visible image and set it as the current one
        this.currentImage = this.images.find((image) => image.style.visibility == "visible");
        
        switch(this.currentImage.id){
            case "frontImage":
                this.images[0].style.visibility = "hidden";
                this.images[1].style.visibility = "visible";
                break;
            case "leftImage":
                this.images[1].style.visibility = "hidden";
                this.images[3].style.visibility = "visible";
                break;
            case "backImage":
                this.images[3].style.visibility = "hidden";
                this.images[2].style.visibility = "visible";
                break;
            case "rightImage":
                this.images[2].style.visibility = "hidden";
                this.images[0].style.visibility = "visible";
                break;
        }

        // Remove the selection circle if it exists
        if(this.currentSelection!=null){
            this.currentSelection.remove();
            this.currentSelection = null;
        }
    }

    _createSelectionCircle = () => {
        // Create a circle selection element 
    
        let selection = document.createElement("img");
        selection.src = chrome.extension.getURL("../images/puzzles/puzzle001/selection.png");
        selection.className = "selection";
        return selection;
    }

    _appendSelectionCircle = (event) => {
        // Append a selection circle to the lower screen

        if (this.currentSelection!=null) this.currentSelection.remove();

        this.currentSelection = this._createSelectionCircle();
        this.currentSelection.style.left = event.offsetX - 12 + "px";
        this.currentSelection.style.top = event.offsetY - 12 + "px";
        this.result = [event.offsetX, event.offsetY];
        
        this.lowerScreen.appendChild(this.currentSelection);
    }

    startPuzzle001 = (lowerScreen) => {

        this.lowerScreen = lowerScreen;
        // Set the first image (front view) as visible
        this.images[0].style.visibility = "visible";
        // Add the rotate button to the upper screen
        this.lowerScreen.appendChild(this.rotateButton);
        // Add the images to the lower screen
        this.images.forEach((image) => {
            // Add the image to the lower screen
            this.lowerScreen.appendChild(image);
            // Show the selection circle and save the result
            image.addEventListener("click", this._appendSelectionCircle);
        });
           
    }

    _checkResultRange = (userSubission, correctResult, offset) => {
        // Check if the user submit is in a correct range
        return userSubission<=(correctResult+offset) && userSubission>=(correctResult-offset)
    }

    checkResult = () => {
        return this._checkResultRange(this.result[0], 280, 10) && this._checkResultRange(this.result[1], 230, 10)
    }
}