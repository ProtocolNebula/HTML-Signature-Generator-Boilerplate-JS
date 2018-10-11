//#region Strings manipulation
/**
 * Replace all ocurrences of string
 * @param {*} string Original string
 * @param {*} search 
 * @param {*} replacement 
 * @link https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
 */
function replaceAll(string, search, replacement) {
    if (string) return string.replace(new RegExp(search, 'g'), replacement);
    return string;
};
//#endregion


//#region URLs
/**
 * Return base URL to the file .html
 */
function getBaseURL() {
    var origin = window.location.origin;
    if (!origin || origin == "null") {
        origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }
    return origin + window.location.pathname;
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
 * Return an object with all data from "generateURL" passed by $_GET
 * @returns {*} All data in $_GET. Willcontain:
 *  - formValues: Values read from Form (to reload a created signature)
 */
function readGET() {
    try {
        var uri = window.location.search.substr(1);
        return decodeURI(uri);
    } catch (e) {
    }
    return '';
}

/**
 * Generate an URL with form data
 * @param {*} elements Object containing all elements to add to url
 * @returns {string} Encoded URI
 */
function generateURL(formValues) {
    // For future improvements
    var uri = {
        formValues: formValues,
    };
    uri = encodeURI(uri);
    return uri;
}
//#endregion


//#region Objects manipulation
/**
 * Clone an object deeply (using json encode/decode)
 * @param {*} object Object to clone
 */
function cloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}

/**
 * Unregister listeners from element
 * @param {*} elements 
 * @param {*} event 
 * @param {*} callback 
 */
function unregisterListeners(elements, event, callback, useCapture) {
    for(var i=0; i < elements.length; i++){
        elements[i].removeEventListener(event, callback, useCapture || false);
    }
}

/**
 * Read the form and return all elements
 * @param {Object} form Form element DOM (document.getElementById(), ...)
 */
function getFormValues(form) {
    var data = {};
    var fields = form.elements;
    var elements = Object.values(fields);

    for (var n = 0; n < elements.length; n++) {
        var element = elements[n];
        
        switch (element.type) {
            case "checkbox":
                data[element.name] = element.checked;
                break;
            default:
                data[element.name] = element.value;
                break;
        }
    }

    return data;
}

/**
 * Select a text from container and copy to clipboard
 * @param {Object} element DOM reference of object to copy
 */
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
//#endregion