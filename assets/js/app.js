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

var REMOTE_FILES_MANAGER = new RemoteFilesManager(); // All files loaded for standalone will added here as pair: URL=>DATA (files don't should be greater than 5kb except logo)

/**
 * Constructor for app class
 * @param {*} settings SETTINGS to use (defined in configurable/Settings.js)
 * @param {*} signatureTemplate SIGNATURE_TEMPLATE to render (configurable/template.js)
 */
function App(settings, signatureTemplate) {
    this.signatureTemplate = signatureTemplate;
    this.data = null; // Temporal variable (reference) used to generate and render signatures
    this.settings = settings;
    this.isLoading = false; // Will be true when will wait some async file or is in execution process
    // this.init();
}

/**
 * Initialize the app and render the signature for the first time if some GET received
 */
App.prototype.init = function() {
    
    // Prepare bind for listeners
    this.generateSignature = this.generateSignature.bind(this);
    this.renderSignature = this.renderSignature.bind(this);
    this.checkFilesReady = this.checkFilesReady.bind(this);
    
    // Initialize components
    var GET = this.readURL();

    this.prepareMustache();
    this.renderForm(GET.formValues);
    if (GET) {
        this.generateSignature();
    } else {
        document.getElementById(SIGNATURE_CONTENT_ID).innerHTML = 'Please, fill the form to get a signature.';
        this.showURLSignature(null, false); // Show link to avoid empty content
    }
}

/**
 * Generate button/onblur action to start generate signature.
 * This process only load all data and call renderSignature.
 */
App.prototype.generateSignature = function() {
    // Load all view elements
    this.isLoading = true;
    this.data = this.settings;
    var signatureContent = document.getElementById(SIGNATURE_CONTENT_ID);

    // Set the form and standalone function
    this.data.form = this.getFormValues();
    this.data.imageURL = this.getImageLinkMethod(this.data);

    // Hook preGenerateSignature
    this.data = AppMiddleware.preGenerateSignature(this.data);

    // Reset error images to download again?
    if (this.data.redownloadImagesIfError && this.isStandalone(this.data)) {
        REMOTE_FILES_MANAGER.resetErrorFiles();
    }

    if (!this.renderSignature()) {
        signatureContent.innerHTML = 'Generating signature. Please wait...';
    } else {
        this.isLoading = false;
    }

    // Generate the URL signature
    this.showURLSignature(this.data);
}

/**
 * Try to render the signature into SIGNATURE_CONTENT_ID
 * If is still loading (standalone elements) it will prepare a callback to render once all is loaded (reacalling this function for redraw)
 * @returns {boolean} True if signature is rendered or false if something is loading
 */
App.prototype.renderSignature = function() {
    var signatureContent = document.getElementById(SIGNATURE_CONTENT_ID);

    var signature = Mustache.render(this.signatureTemplate, this.data);

    // Hook postGenerateSignature
    signature = AppMiddleware.postGenerateSignature(signature);

    if (!this.isStandalone(this.data) || REMOTE_FILES_MANAGER.allFilesLoaded()) {
        // All ready, show the signature
        signatureContent.innerHTML = signature;
        this.isLoading = false;
        return true;
    }

    // Wait until elements is loaded (this method will called through checkFilesReady as callback)
    return false;
}

/**
 * This function will be called from CACHED_FILES as callback from "imageURL()""
 * Basically check if all files are ready (not null) and if true, will call to "renderSignature"
 */
App.prototype.checkFilesReady = function() {
    if (this.isLoading && REMOTE_FILES_MANAGER.allFilesLoaded() === true) {
        this.renderSignature();
    }
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
    Mustache.parse(this.signatureTemplate);
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
 * Generate a link with URL to edit form and 
 * @param {*} data All data elements used in the template
 * @param {boolean} changeURL Default TRUE. it will change the current user URL
 * @returns {string} Generated url
 */
App.prototype.showURLSignature = function(data, changeURL) {
    if (changeURL === undefined) changeURL = true;
    
    var url = (data) ? '?' + this.generateURL(data.form) : '';

    // Set the url in address bar
    if (changeURL) {
        window.history.pushState("", "", url);
    }

    // Set the URL in container link
    url = getBaseURL() + url;
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
APP = new App(SETTINGS, SIGNATURE_TEMPLATE);
document.addEventListener('DOMContentLoaded', function(){ 
    APP.init();
}, false);