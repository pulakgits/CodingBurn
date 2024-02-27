document.addEventListener("DOMContentLoaded", function () {
    var editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
        mode: "javascript",
        lineNumbers: true,
        theme: "monokai", // Set your preferred theme
        autoCloseBrackets: true,
        matchBrackets: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete", // Enable autocomplete with Ctrl+Space
            "Ctrl-/": "toggleComment", // Toggle line comment with Ctrl+/
        },
    });

    // Autocomplete
    CodeMirror.registerHelper("hint", "javascript", function (editor) {
        var word = /[\w$]+/;
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && word.test(curLine.charAt(start - 1))) --start;
        var prefix = start != end && curLine.slice(start, end);
        var list = ["if", "else", "for", "while", "function"]; // Example list, you can add more
        return {
            list: list.filter(function (item) {
                return item.startsWith(prefix);
            }),
            from: CodeMirror.Pos(cur.line, start),
            to: CodeMirror.Pos(cur.line, end),
        };
    });

    var runButton = document.getElementById("run-button");
    var outputDiv = document.getElementById("output");

    runButton.addEventListener("click", function () {
        try {
            // Clear previous output
            outputDiv.innerHTML = "";

            // Redirect console output to the outputDiv
            var oldConsoleLog = console.log;
            console.log = function (message) {
                if (typeof message === "object") {
                    outputDiv.innerHTML += JSON.stringify(message) + "<br>"; // Stringify object
                } else {
                    outputDiv.innerHTML += message + "<br>";
                }
            };

            // Execute the code
            var code = editor.getValue();
            var result = eval(code);
            if (result !== undefined) {
                if (typeof result === "object") {
                    outputDiv.innerHTML = JSON.stringify(result);
                } else {
                    outputDiv.innerHTML = result;
                }
            }

            // Restore original console.log
            console.log = oldConsoleLog;
        } catch (error) {
            outputDiv.innerHTML = "Error: " + error.message;
        }
    });

    // Syntax Checking (JSHint example)
    editor.on("change", function (cm, change) {
        JSHINT(cm.getValue());
        var errors = JSHINT.data().errors;
        if (errors) {
            outputDiv.innerHTML = errors
                .map(function (err) {
                    return err.reason + " at line " + err.line + "<br>";
                })
                .join("");
        } else {
            outputDiv.innerHTML = "No errors found";
        }
    });

    // Save and Load
    var saveButton = document.getElementById("save-button");
    var loadButton = document.getElementById("load-button");

    saveButton.addEventListener("click", function () {
        var code = editor.getValue();
        localStorage.setItem("savedCode", code);
        alert("Code saved successfully");
    });

    loadButton.addEventListener("click", function () {
        var savedCode = localStorage.getItem("savedCode");
        if (savedCode) {
            editor.setValue(savedCode);
            alert("Code loaded successfully");
        } else {
            alert("No saved code found");
        }
    });

    // Themes and Customization
    var themeSelect = document.getElementById("theme-select");
    themeSelect.addEventListener("change", function () {
        var theme = themeSelect.value;
        editor.setOption("theme", theme);
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "s") {
            // Ctrl + S for saving
            saveButton.click();
        } else if (e.ctrlKey && e.key === "r") {
            // Ctrl + R for running code
            runButton.click();
        }
    });
});

// input output area reisizer
{
    const resizer = document.querySelector(".input-output-area-resizer");
    const inputArea = document.querySelector(".input-area");
    const outputArea = document.querySelector(".output-area");
    let isResizing = false;
    let startX, startWidthInput, startWidthOutput;

    resizer.addEventListener("mousedown", function (event) {
        isResizing = true;
        startX = event.clientX;
        startWidthInput = inputArea.offsetWidth;
        startWidthOutput = outputArea.offsetWidth;

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    });

    function handleMouseMove(event) {
        if (isResizing) {
            const widthDiff = event.clientX - startX;
            const newWidthInput = startWidthInput + widthDiff;
            const newWidthOutput = startWidthOutput - widthDiff;

            inputArea.style.width = `${newWidthInput}px`;
            outputArea.style.width = `${newWidthOutput}px`;
        }
    }

    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }
}

{
    const resizer = document.querySelector(".code-deitor-section-resizer-horizontal");
    const editorSection = document.querySelector(".code-editor-section");
    let isResizing = false;
    let startX, startWidth;

    resizer.addEventListener("mousedown", function (event) {
        isResizing = true;
        startX = event.clientX;
        startWidth = parseInt(document.defaultView.getComputedStyle(editorSection).width, 10);

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    });

    function handleMouseMove(event) {
        if (isResizing) {
            const width = startWidth + (event.clientX - startX);
            editorSection.style.width = `${width}px`;
        }
    }

    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }
}

{
    const resizerVertical = document.querySelector(".code-deitor-section-resizer-vertical");
    const inputArea = document.querySelector(".code-editor-section");

    let isResizingVertical = false;
    let startY, startHeight;

    resizerVertical.addEventListener("mousedown", function (event) {
        isResizingVertical = true;
        startY = event.clientY;
        startHeight = inputArea.offsetHeight;

        document.addEventListener("mousemove", handleMouseMoveVertical);
        document.addEventListener("mouseup", handleMouseUpVertical);
    });

    function handleMouseMoveVertical(event) {
        if (isResizingVertical) {
            const heightDiff = event.clientY - startY;
            const newHeight = startHeight + heightDiff;
            // Limit the maximum height to 500px
            const maxHeight = 500;
            inputArea.style.height = `${Math.min(newHeight, maxHeight)}px`;
        }
    }

    function handleMouseUpVertical() {
        isResizingVertical = false;
        document.removeEventListener("mousemove", handleMouseMoveVertical);
        document.removeEventListener("mouseup", handleMouseUpVertical);
    }
}
