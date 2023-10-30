class SpriteAnimator {

    constructor(fps){
        this.animationFrame = null;
        this.spriteIndex = 0;
        this.fps = fps
        this.stopAnimation = false;
    }

    _animate = (target, sprites, loop) => {
        /* 
        Set up animation frame. 
        Given an HTML target and a list of sprites, animate the target by looping through every sprite in the list (if loop is true). 
        Alternatively, if loop is false, stop the animation after the last sprite.
        */

        setTimeout(() =>{

            if (this.stopAnimation)
            {
                window.cancelAnimationFrame(this.animationFrame);
                this.stopAnimation = false;
                return;
            }

            target.src = chrome.extension.getURL(sprites[this.spriteIndex]);
            this.spriteIndex++;

            if (this.spriteIndex == sprites.length)
            {
                if (loop){
                    this.spriteIndex = 0;
                } else {
                    window.cancelAnimationFrame(this.animationFrame);
                }
            }

            this.animationFrame = window.requestAnimationFrame(() => this.animate(target, sprites, loop))

        }, 1000/this.fps);
    }

    resetAnimator = () => {
        /* Reset the animator to its initial state. */

        this.spriteIndex = 0;
        this.stopAnimation = false;
        if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }

    animate = (target, sprites, loop) => this._animate(target, sprites, loop)

    cancelAnimation = () => this.stopAnimation = true
}