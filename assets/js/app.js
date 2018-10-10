/*
 This is the main app script.
 Here signature is generated using form information.
 */

/*
 * Global Vars
 */
var FORM_ID = 'form';
var FORM_INPUTS = '#'+FORM_ID+' input';
var SIGNATURE_CONTENT_ID = 'signature';
var SIGNATURE_URL_ID = 'signature-link';
var APP; // Will contain the app instance

var CACHED_FILES = new RemoteFilesManager(); // All files loaded for standalone will added here as pair: URL=>DATA (files don't should be greater than 5kb except logo)

function App(settings) {
    this.settings = settings;
    this.init();
}

/**
 * This initialize the app
 */
App.prototype.init = function() {
    var GET = this.readURL();

    // Prepare bind for listeners
    this.generateSignature = this.generateSignature.bind(this);

    // Initialize components
    this.prepareMustache();
    this.renderForm(GET.formValues);
    this.generateSignature();
}

/**
 * Load all data and render signature
 */
App.prototype.generateSignature = function() {
    // Load all view elements
    var data = this.settings;
    var signatureContent = document.getElementById(SIGNATURE_CONTENT_ID);

    // Set the form and standalone function
    data.form = this.getFormValues();
    data.imageURL = this.getImageLinkMethod(data);

    // Hook preGenerateSignature
    data = AppMiddleware.preGenerateSignature(data);

    if (!this.renderSignature(SIGNATURE_TEMPLATE, data)) {
        signatureContent.innerHTML('Generating signature. Please wait...');
    }

    // Generate the URL signature
    this.showURLSignature(data);
}

/**
 * Try to render the signature into SIGNATURE_CONTENT_ID
 * If is still loading (standalone elements) it will prepare a callback to render once all is loaded (reacalling this function for redraw)
 * @returns {boolean} True if signature is rendered or false if something is loading
 */
Array.prototype.renderSignature(template, data) {
    var signatureContent = document.getElementById(SIGNATURE_CONTENT_ID);

    var signature = Mustache.render(SIGNATURE_TEMPLATE, data);

    // Hook postGenerateSignature
    signature = AppMiddleware.postGenerateSignature(signature);

    if (!this.isStandalone(data) || this.allFilesLoaded()) {
        // All ready, show the signature
        signatureContent.innerHTML = signature;
        return true;
    }

    // Wait until all is loaded

    return false;
}

/*
 * Other methods
 */

/**
 * Prepare the main listeners for the form
 * This will unregistrer all listeners before register all again
 */
App.prototype.registerListeners = function() {
    // First unregister all listeners
    this.unregisterListeners();

    // Then register all again
    var formInputs = document.querySelectorAll(FORM_INPUTS);
    for(var i=0; i < formInputs.length; i++){
        formInputs[i].addEventListener('blur', this.generateSignature, false);
    }
}

App.prototype.unregisterListeners = function() {
    var formInputs = document.querySelectorAll(FORM_INPUTS);
    unregisterListeners(formInputs, 'blur', this.generateSignature, false);
}

/**
 * Do all Mustache cache parse
 */
App.prototype.prepareMustache = function() {
    Mustache.parse(TEMPLATE_FORM);
    Mustache.parse(SIGNATURE_TEMPLATE);
}

/**
 * Show edition form
 * @param {*} restoredData Data restored from "readURL", if empty will show "defaultValue"
 */
App.prototype.renderForm = function(restoredData) {
    var fields = cloneObject(this.settings);
    if (restoredData !== undefined && restoredData) {
        fields.fields = this.setDefaultValuesToFields(fields.fields, restoredData);
    }
    document.getElementById(FORM_ID).innerHTML = Mustache.render(TEMPLATE_FORM, fields);
    this.registerListeners();
}

/**
 * Add "defaultvalue" to "field" elements (if element exist in fields)
 * TODO: Make this compatible with "form.js" free rendering
 * @param {*} fields Original Form fields
 * @param {*} values Values to restore
 */
App.prototype.setDefaultValuesToFields = function(fields, values) {
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
App.prototype.getFormValues = function() {
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
App.prototype.showURLSignature = function(data, changeURL) {
    if (changeURL === undefined) changeURL = true;
    
    var url = this.generateURL(data.form);

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
App.prototype.generateURL = function(formValues) {
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
App.prototype.readURL = function() {
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
App.prototype.getImageLinkMethod = function(data) {
    return (this.isStandalone(data)) ? data.imageURLStandalone : data.imageURLNormal;
}

/**
 * Check if data is in standalone mode or not
 * @param {*} data 
 */
App.prototype.isStandalone = function(data) {
    return (data.standaloneMode === 0 && data.form.standalone || data.standaloneMode === 2);
}

// Load on start
document.addEventListener('DOMContentLoaded', function(){ 
    APP = new App(SETTINGS);
}, false);