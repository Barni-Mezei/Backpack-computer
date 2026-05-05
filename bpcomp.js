
let screenManager = new BPCScreenManager();
screenManager.switchScreen("boot");

screenManager.addScreen(new BPCScreen(
    "boot",

    {
        spinnerChars: "|/-\\",
        spinnerIndex: 0,

        dots: 0,
    },

    function (start, data, clock) {
        data.spinnerIndex = clock % 4;
        data.dots = Math.floor(clock/2) % 4;

        if (clock > 32) screenManager.switchScreen("terminal");

        return `\
 --- B.P.C ---
$ help
OS: BPos 1.0
CPU: 8-bit
RAM: 256 bytes
CLK: 8Hz   [${data.spinnerChars[data.spinnerIndex]}] 

Booting${Array(data.dots).fill(".").join("")}
`;
    }
));

screenManager.addScreen(new BPCScreen(
    "terminal",

    {
        cursorVisible: true,
        visibleChars: 0,
        visits: 0,
        text: "scanner",
    },

    function (start, data, clock) {
        if (start) {
            data.visibleChars = 0;
            data.visits++;

            if (data.visits > 1) {
                data.text = "";
            }
        }

        data.cursorVisible = clock % 4 < 2;
        data.visibleChars += 1;

        if (data.visits == 1 && data.visibleChars >= data.text.length + 4) screenManager.switchScreen("scanner");

        return `\
 --- B.P.C ---
$ ${data.text.substr(0, data.visibleChars)}${data.cursorVisible ? "_" : ""}
`;
    }
));

screenManager.addScreen(new BPCScreen(
    "scanner",

    {
        rowIndex: 0,
        direction: 1,
        passes: 0,
    },

    function (start, data, clock) {
        if (start) {
            data.rowIndex = 0;
            data.direction = 1;
            data.passes = 0;
        }

        data.rowIndex += data.direction;

        if (data.rowIndex == 0 && data.direction < 0) {
            data.passes++;
            data.direction = 1;
        }

        if (data.passes >= 2) screenManager.switchScreen("terminal");

        if (data.rowIndex >= 7) data.direction = -1;

        let out = Array(data.rowIndex).fill("\n").join("");
        out += "--==#######==--\n";

        return out;
    }
));