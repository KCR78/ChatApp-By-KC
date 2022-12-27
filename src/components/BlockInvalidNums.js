const charSet =
    [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
        "Backspace", "Enter", "Delete",
        "ArrowRight", "ArrowLeft", "Home", "End",
        "Control"
    ];

const ctrlOptions = ["v", "V", "c", "C", "x", "X", "a", "A"];

export const blockInvalidNums = e => {
    if (e.ctrlKey) !ctrlOptions.includes(e.key) && e.preventDefault();
    else !charSet.includes(e.key) && e.preventDefault();
};