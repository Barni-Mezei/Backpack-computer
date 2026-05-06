class BPCScreenManager {
    screens = {};
    nextScreen = "";
    currentScreen = "";
    clock = 0;

    constructor() {
        this.screens = {};
        this.clock = 0;
    }

    /**
     * Adds a new screen to the screen array
     * @param {BPCScreen} screen The screen to add to the array
     */
    addScreen(screen) {
        this.screens[screen.id] = screen;

        if (this.currentScreen == "") this.currentScreen = screen.id;
    }

    switchScreen(screenId) {
        this.nextScreen = screenId;
    }

    update() {
        let isStart = false;

        if (this.nextScreen != "") {
            this.currentScreen = this.nextScreen;
            isStart = true;
            this.nextScreen = "";
        }

        let out = this.screens[this.currentScreen].update(
            isStart,
            this.clock
        );

        this.clock += 1;

        return out;
    }
}

class BPCScreen {
    id = "";

    screenData = {}
    callback;

    constructor(id, screenData, callback) {
        this.id = id;
        this.screenData = screenData;
        this.callback = callback;
    }

    update(start, clock) {
        return this.callback(start, this.screenData, clock);
    }
}