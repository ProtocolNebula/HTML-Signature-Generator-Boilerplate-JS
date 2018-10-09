/*
 This is the main app script.
 Here signature is generated using form information.
 */

/*
 * Global Vars
 */
var FORM_ID = 'form';
var SIGNATURE_CONTENT_ID = 'signature';
var SIGNATURE_URL_ID = 'signature-link';

/*
 * Main Methods
 */

/**
 * This initialize the app
 */
function init() {
    var GET = readURL();

    prepareMustache();
    renderForm(GET.formValues);
    generateSignature();
}

/**
 * Load all data and render signature
 */
function generateSignature() {
    // Load all view elements
    var data = ADDITIONAL_INFO;
    data.form = getFormValues();

    // Set the standalone methods
    data.imageURL = getImageLinkMethod(data);

    // Hook preGenerateSignature
    data = preGenerateSignature(data);
    
    // Generate the signature
    var signature = Mustache.render(SIGNATURE_TEMPLATE, data);

    // Hook postGenerateSignature
    signature = postGenerateSignature(signature);

    // Show signature
    document.getElementById(SIGNATURE_CONTENT_ID).innerHTML = signature;

    // Generate the URL signature
    showURLSignature(data);
}

/*
 * Other methods
 */

/**
 * Do all Mustache cache parse
 */
function prepareMustache() {
    Mustache.parse(TEMPLATE_FORM);
    Mustache.parse(SIGNATURE_TEMPLATE);
}

/**
 * Show edition form
 * @param {*} restoredData Data restored from "readURL", if empty will show "defaultValue"
 */
function renderForm(restoredData) {
    var fields = cloneObject(FORM_FIELDS);
    if (restoredData !== undefined && restoredData) {
        fields.fields = setDefaultValuesToFields(fields.fields, restoredData);
    }
    document.getElementById(FORM_ID).innerHTML = Mustache.render(TEMPLATE_FORM, fields);
}

/**
 * Add "defaultvalue" to "field" elements (if element exist in fields)
 * TODO: Make this compatible with "form.js" free rendering
 * @param {*} fields Original Form fields
 * @param {*} values Values to restore
 */
function setDefaultValuesToFields(fields, values) {
    for (var n = 0; n < fields.length; n++) {
        var fieldName = fields[n].name;
        if (typeof values[fieldName] !== "undefined") {
            fields[n].defaultValue = values[fieldName];
        }
    }
    return fields;
}

/**
 * Read the form and return all elements
 */
function getFormValues() {
    var data = {};
    var fields = document.getElementById(FORM_ID).elements;
    var elements = Object.values(fields);

    for (var n = 0; n < elements.length; n++) {
        var element = elements[n];
        data[element.name] = element.value;
    }

    return data;
}

/**
 * Generate a link with URL to edit form and 
 * @param {*} data All data elements used in the template
 * @param {boolean} changeURL Default TRUE. it will change the current user URL
 * @returns {string} Generated url
 */
function showURLSignature(data, changeURL) {
    if (changeURL === undefined) changeURL = true;
    
    var url = generateURL(data.form);

    // Set the url in address bar
    if (changeURL) {
        window.history.pushState("", "", '?' + url);
    }

    // Set the URL in container link
    url = getBaseURL() + '?' + url;
    document.getElementById(SIGNATURE_URL_ID).innerHTML = '<a href="'+url+'">'+url+'</a>';

    return url;
}

/**
 * Generate an URL with form data
 * @param {*} elements Object containing all elements to add to url
 */
function generateURL(formValues) {
    // For future improvements
    var uri = {
        formValues: formValues,
    };
    uri = encodeURI(uri);
    return uri;
}

/**
 * Return an object with all data from "generateURL" passed by $_GET
 * @returns {*} All data in $_GET. Willcontain:
 *  - formValues: Values read from Form (to reload a created signature)
 */
function readURL() {
    try {
        var uri = window.location.search.substr(1);
        return decodeURI(uri);
    } catch (e) {
    }
    return '';
}

/**
 * Return the correct method to use imageURL() depending of standalone method
 * If standalone, it will incrustate the image in base64 instead a normal src link
 */
function getImageLinkMethod(data) {
    var standalone = (data.form.standaloneMode === 0 && data.form.standalone !== undefined && data.form.standalone || data.standaloneMode === 2);
    return (standalone) ? data.imageURLStandalone : data.imageURLNormal;
}

// Load on start
document.addEventListener('DOMContentLoaded', function(){ 
    init();
}, false);