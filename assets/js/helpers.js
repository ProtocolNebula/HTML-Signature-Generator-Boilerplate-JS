function copyText(element) {
    var range, selection, worked;

    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    try {
        document.execCommand('copy');
        alert('Text copied.');
    }
    catch (err) {
        alert('Your browser is not compatible with text copy.');
    }
}

/**
 * Replace all ocurrences of string
 * @param {*} string Original string
 * @param {*} search 
 * @param {*} replacement 
 * @link https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
 */
function replaceAll(string, search, replacement) {
    return string.replace(new RegExp(search, 'g'), replacement);
};

/**
 * Clone an object deeply (using json encode/decode)
 * @param {*} object Object to clone
 */
function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Encode an object to JSON->BASE64
 * @param {*} object 
 */
function encodeURI(object) {
    return btoa(JSON.stringify(object));
}

/**
 * Decode an object from BASE64->JSON
 * @param {*} string 
 */
function decodeURI(string) {
    return JSON.parse(atob(string));
}

/**
 * Return base URL to the file .html
 */
function getBaseURL() {
    return window.location.origin + window.location.pathname;
}
