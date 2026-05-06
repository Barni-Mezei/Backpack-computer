
let screenManager = new BPCScreenManager();
screenManager.switchScreen("boot");

// Boot
screenManager.addScreen(new BPCScreen(
    "boot",

    {
        percent: 0,
        dots: 0,
    },

    function (start, data, clock) {
        if (start) {
            data.percent = 0;
        }

        if (isKeyPressed("b,Enter,\\ ")) screenManager.switchScreen("terminal");

        if (clock % 6 == 0) {
            data.percent += randInt(12, 30);
            data.percent = clamp(data.percent, 0, 100);
        }

        data.dots = clock % 4;

        if (data.percent >= 100) screenManager.switchScreen("terminal");

        let alert = clock % 2 == 0 ? "!" : " ";

        return `\
Booting${Array(data.dots).fill(".").join("")}

Progress: ${data.percent}%


${alert} .##.0.1. ${alert}
  .1#1.0..
  .1#..01#
`;
    }
));

// Terminal
screenManager.addScreen(new BPCScreen(
    "terminal",

    {
        cursorVisible: true,
        visits: 0,
        text: "",
        lines: [],
    },

    function (start, data, clock) {
        if (start) {
            data.visits++;
            data.text = "";
            data.lines = [];
        }

        data.cursorVisible = clock % 4 < 2;

        let maxHeight = 6; // lines
        let maxWidth = 12; // chars

        if (keys.buffer.length > 0) {
            for (let e of keys.buffer) {
                if (e.key.length == 1) {
                    data.text += e.key;
                } else {
                    if (e.key == "Backspace") data.text = data.text.substr(0, data.text.length - 1);
                    if (e.key == "Enter") {
                        let l = "> " + data.text.substr(0, maxWidth);
                        data.lines.push(l);

                        switch (data.text) {
                            case "clear":
                                data.lines = [];
                                break;

                            case "scanner":
                                screenManager.switchScreen("scanner");
                                break;

                            case "info":
                                screenManager.switchScreen("info");
                                break;

                            case "receive":
                                screenManager.switchScreen("receive");
                                break;

                            case "bcomp":
                                screenManager.switchScreen("bcomp");
                                break;

                            case "help":
                                data.lines.push("clear   scanner");
                                data.lines.push("recieve info");
                                data.lines.push("Press [F2]");
                                break;
                        }

                        data.text = "";
                    };
                }
            }
        }

        let visibleLines = data.lines.slice(Math.max(0, data.lines.length - maxHeight));
        let visibleText = data.text.substr(Math.max(0, data.text.length - maxWidth), maxWidth);

        return `\
 --- B.P.C ---
${visibleLines.join("\n")}${visibleLines.length > 0 ? "\n" : ""}\
$ ${visibleText}${data.cursorVisible ? "_" : ""}`;
    }
));

// Info
screenManager.addScreen(new BPCScreen(
    "info",

    {
        spinnerChars: "|/-\\",
        spinnerIndex: 0,
    },

    function (start, data, clock) {
        data.spinnerIndex = clock % 4;

        if (isKeyPressed("q")) screenManager.switchScreen("terminal");

        return `\
 --- INFO  ---
OS: BPos 1.2
CPU: 8-bit
RAM: 256 bytes
CLK: 8Hz   [${data.spinnerChars[data.spinnerIndex]}] 

[F2] maximise
[q] to exit
`;
    }
));

// Scanner
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

// Receive
screenManager.addScreen(new BPCScreen(
    "receive",

    {
    },

    function (start, data, clock) {
        if (isKeyPressed("q")) screenManager.switchScreen("terminal");

        let image = [
            "               ",
            "     ,,,,,     ",
            "    ,.1.0.,    ",
            "    ,....,,    ",
            "    ,,,,,,,    ",
            "      ,,,      ",
            "     ,,+,,     ",
            "    ,,,,,,,    ",
        ];

        let out = "";
        
        for (let lineIndex in image) {
            let line = image[lineIndex];

            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                if (line[charIndex] == " ") {
                    let r = Math.random();

                    if (r < 0.05) {
                        line = replaceAt(line, charIndex, Math.random() < 0.5 ? "1" : "0");
                        continue;
                    }
                    
                    if (r < 0.5) {
                        line = replaceAt(line, charIndex, "+");
                        continue;
                    }

                    if (r < 0.75) {
                        line = replaceAt(line, charIndex, ".");
                        continue;
                    }

                    line = replaceAt(line, charIndex, " ");
                }
            }

            out += line + "\n";
        }

        return out;
    }
));

// Bcomp
screenManager.addScreen(new BPCScreen(
    "bcomp",

    {
        spinnerChars: "|/-\\",
        spinnerIndex: 0,
    },

    function (start, data, clock) {
        data.spinnerIndex = clock % 4;

        if (isKeyPressed("q")) screenManager.switchScreen("terminal");

        return `\
 --- bcomp ---
CPU: 16  bit
RAM: 256 bytes
CLK: 8t    [${data.spinnerChars[data.spinnerIndex]}] 

ASM:   V2.2
MACRO: yes
Made in SM
`;
    }
));