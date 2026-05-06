let keys = {
    justPressed: new Set(),
    pressed: new Set(),
    buffer: [],
}

window.addEventListener("keydown", function (e) {
    keys.pressed.add(e.key);

    if (!e.repeat) {
        keys.justPressed.add(e.key);
        keys.buffer.push(e);
    }
});

window.addEventListener("keyup", function (e) {
    //e.preventDefault();

    keys.pressed.delete(e.key);
    keys.pressed.delete(e.key.toLowerCase());
    keys.pressed.delete(e.key.toUpperCase());
});

window.addEventListener("blur", _inputLost);
window.addEventListener("focus", _inputLost);
window.addEventListener("mouseleave", _inputLost);

function _inputLost() {
    keys.pressed.clear();
    keys.justPressed.clear();
}

function updateInputs() {
    keys.justPressed.clear();
}

function clearBuffer() {
    keys.buffer = [];
}

/**
 * Checks if a keycombination is held down or not
 * @param {String} filterString A string, representing a key combination
 * @param {Set} set A set of values, representing pressed keys
 * @returns {Boolean} Is the keycombination, specified in the filterString currently pressed down?
 */
function _testKeyId(filterString, set) {
    let parsedString = _parseFilterString(filterString);

    let pressed = false;
    
    parsedString.every(and => {
        pressed = and.every(key => {
            return set.has(key);
        });

        return !pressed;
    });

    return pressed;
}

/**
 * Returns with an array, representing the conection between the pressed keys
 * @param {String} filterString A filter string (key id) with "," and "+" characters
 * @returns {Array} A 2d array, where the forst dimension is OR and the 2nd dimension is AND, like this: [["Control", "F"], ["F3"]]
 */
function _parseFilterString(filterString) {
    let out = [];

    let isEscape = false;
    let currentKey = "";
    let keysOut = [];

    for (let i = 0; i < filterString.length; i++) {
        // Add escaped character to the key
        if (isEscape) {
            currentKey += filterString[i];
            isEscape = false;
            continue;
        }

        // Escape next character
        if (filterString[i] == "\\") {
            isEscape = true;
            continue;
        }

        // Discard spaces
        if (filterString[i] == " ") continue;

        // Add key to sub array
        if (filterString[i] == "+") {
            keysOut.push(currentKey);
            currentKey = "";
            continue;
        };
        
        // Add key to sub array, then to main array
        if (filterString[i] == ",") {
            keysOut.push(currentKey);
            out.push(keysOut);
            keysOut = [];
            currentKey = "";
            continue;
        };

        currentKey += filterString[i];
    }

    if (currentKey != "") {
        keysOut.push(currentKey);
        out.push(keysOut);
    }

    return out;
}

function isKeyPressed(keyFilter) {
    let buf = new Set(keys.buffer.map(e => e.key));

    return _testKeyId(keyFilter, buf);
}