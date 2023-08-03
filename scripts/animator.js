class Animator {

    constructor(fps){
        this.animationFrame = null;
        this.spriteIndex = 0;
        this.fps = fps
        this.stop = false;
    }

    _animate = (target, sprites, speed, loop) => {
        /* Animate the character by changing the character sprite every "speed" miliseconds. */

        setTimeout(() =>{

            if (this.stop){
                window.cancelAnimationFrame(this.animationFrame);
                return;
            }

            target.src = chrome.extension.getURL(sprites[this.spriteIndex]);
            this.spriteIndex++;

            if (this.spriteIndex == sprites.length){
                if (loop){
                    this.spriteIndex = 0;
                } else {
                    window.cancelAnimationFrame(this.animationFrame);
                }
            }

            this.animationFrame = window.requestAnimationFrame(() => this.animate(target, sprites, speed, loop))

        }, 1000/this.fps);
    }

    animate = (target, sprites, speed, loop) => this._animate(target, sprites, speed, loop)

    cancelAnimation = () => this.stop = true
}