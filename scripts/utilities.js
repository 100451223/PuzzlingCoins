function chooseRandom(array) {
    /* Choose a random element from an array */

    return array[Math.floor(Math.random() * array.length)]
}

function initialSetUp(){
    /* Set up the local storage object for the user */

    chrome.storage.local.get(["usersCase"], (result) => {
        if (result.usersCase == undefined)
            chrome.storage.local.set({usersCase: {coinsAmount: 0, todayIs: new Date().getDate(), coinsToday: 0}});
        });
}
