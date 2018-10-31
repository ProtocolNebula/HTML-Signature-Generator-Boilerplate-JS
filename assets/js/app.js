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
var DEFAULT_SIGNATURE = 'default'; // Change in loaderSettings.js too

var REMOTE_FILES_MANAGER = new RemoteFilesManager(); // All files loaded for standalone will added here as pair: URL=>DATA (files don't should be greater than 5kb except logo)

/**
 * Constructor for app class
 * @param {*} settings SETTINGS to use (defined in configurable/Settings.js)
 * @param {*} signatureTemplate SIGNATURE_TEMPLATE to render (configurable/template.js)
 */
function App(settings, signatureTemplate) {
    this.data = settings;
    this.isLoading = false; // Will be true when will wait some async file or is in execution process
    this.inited = false; // Check if object is inited
    
    this.signatureTemplate = signatureTemplate;
    this.signatureSettings = {};
    this.currentSignature = null;
}

//#region Init functions

/**
 * Add signature settings to let change
 * @param {string} signature Name of the template
 * @param {Object} settings Object loaded form "loaderSettings.js" which contain key as files and their loaded content
 */
App.prototype.addSignatureSettings = function(signature, settings) {
    this.signatureSettings[signature] = settings;
    this.prepareMustache();
    if (this.currentSignature) {
        this.setSignature(signature);
    }
}

/**
 * Change the current signature and launch generate process
 */
App.prototype.setSignatureSettings = function(signature) {
    this.currentSignature = signature;
    if (this.inited) {
        this.generateSignature();
    }
}

/**
 * Get settings of an specific signature.
 * If setting no exist, will load from default
 * @param {string} setting Setting file to obtain (this.signatureSettings[signature])
 *  EX: settings.js
 * @param {string} signature OPTIONAL: Signature to get
 */
App.prototype.getSignatureSetting = function(setting, signature) {
    if (!signature) {
        signature = this.currentSignature;
    }

    // No signature specified/loaded
    if (!signature) {
        console.error('Get signature settings: no signature specified');
        return;
    }

    // Check if signature exist
    if (this.signatureSettings[signature] === undefined 
        || this.signatureSettings[signature][setting] === undefined
    ) {
        // If is not default signature, try to load from default
        if (this.signatureSettings[signature] !== DEFAULT_SIGNATURE) {
            return this.getSignatureSetting(setting, DEFAULT_SIGNATURE);
        } else {
            console.error("Setting " + setting + " not found");
            return;
        }
    }
    
    // Return signature data
    return this.signatureSettings[signature][setting];
}

/**
 * Initialize the app and render the signature for the first time if some GET received
 */
App.prototype.init = function() {
    
    // Prepare bind for listeners
    this.generateSignature = this.generateSignature.bind(this);
    this.renderSignature = this.renderSignature.bind(this);
    this.checkFilesReady = this.checkFilesReady.bind(this);

    // Set object as init
    this.inited = true;
    
    // Initialize components
    var GET = this.readGET();
    var isEmpty = Object.keys(GET.formValues).length === 0;

    this.restoreForm(GET.formValues); // Restore or create necessary object for form
    this.renderForm();
    if (!isEmpty) {
        this.generateSignature();
    } else {
        this.setSignature('Please, fill the form to get a signature.');
        this.showURLSignature(null, false); // Show link to avoid empty content
    }
}

App.prototype.refresh = function() {
}

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

/**
 * Remove all listeners created in "registerListeners"
 */
App.prototype.unregisterListeners = function() {
    var formInputs = document.querySelectorAll(FORM_INPUTS);
    unregisterListeners(formInputs, 'blur', this.generateSignature, false);
}

/**
 * Do all Mustache cache parse
 * Prepare the template for a signature
 */
App.prototype.prepareMustache = function(signature) {
    if (!signature) signature = this.currentSignature;

    var templateSignature = this.getSignatureSetting('template.js', signature),
        templateForm = this.getSignatureSetting('form.js', signature);

    if (templateForm && templateSignature) {
        Mustache.parse(templateForm);
        Mustache.parse(templateSignature);
    }
}

//#endregion

//#region "Settings Helpers"
/**
 * Default behavior to show an URL file on the generated signature
 * @param {*} url File URI to show
 * @param {*} render Renderer from moustache.js
 */
App.prototype.urlAsLink = function(url, render) {
    return render(url);
}

/**
 * Show an incrustated file using an URL using RemoteFilesManager
 * @param {*} url File URI to incrustate
 * @param {*} render Renderer from moustache.js
 */
App.prototype.urlStandalone = function(url, render) {
    var file = REMOTE_FILES_MANAGER.getFile(url, APP.checkFilesReady, 2, APP.checkFilesReady);
    if (file) {
        return render(file);
    }
}
//#endregion

//#region signature generation and rendering
/**
 * Generate button/onblur action to start generate signature.
 * This process only load all data and call renderSignature.
 */
App.prototype.generateSignature = function() {
    // Load all view elements
    this.isLoading = true;

    // Set the form and standalone function | NOT replace "this.data.fields[].value"
    this.data.form = getFormValues(document.getElementById(FORM_ID));
    this.data.imageURL = this.getImageLinkMethod(this.data);

    // Hook preGenerateSignature
    this.data = AppMiddleware.preGenerateSignature(this.data);

    // Reset error images to download again?
    if (this.data.redownloadImagesIfError && this.isStandalone(this.data)) {
        REMOTE_FILES_MANAGER.resetErrorFiles();
    }

    if (!this.renderSignature()) {
        this.setSignature('Generating signature. Please wait...');
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
    var signature = Mustache.render(this.signatureTemplate, this.data);

    // Hook postGenerateSignature
    signature = AppMiddleware.postGenerateSignature(signature);

    if (!this.isStandalone(this.data) || REMOTE_FILES_MANAGER.allFilesLoaded()) {
        // All ready, show the signature
        this.setSignature(signature);
        this.isLoading = false;
        return true;
    }

    // Wait until elements is loaded (this method will called through checkFilesReady as callback)
    return false;
}

/**
 * Generate a link with URL to edit form and 
 * @param {*} data All data elements used in the template
 * @param {boolean} changeURL Default TRUE. it will change the current user URL
 * @returns {string} Generated url
 */
App.prototype.showURLSignature = function(data, changeURL) {
    if (changeURL === undefined) changeURL = true;
    
    var url = (data) ? '?' + generateURL(data.form) : '';

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
 * This function will be called from CACHED_FILES as callback from "imageURL()""
 * Basically check if all files are ready (not null) and if true, will call to "renderSignature"
 */
App.prototype.checkFilesReady = function() {
    if (this.isLoading && REMOTE_FILES_MANAGER.allFilesLoaded() === true) {
        this.renderSignature();
    }
}
//#endregion

//#region Helpers
/**
 * Helper to read GET with default objects if null
 */
App.prototype.readGET = function() {
    var GET = readGET();
    if (!GET) GET = { formValues: {} };
    return GET;
}
/**
 * Render and show edition form
 */
App.prototype.renderForm = function() {
    document.getElementById(FORM_ID).innerHTML = Mustache.render(this.getSignatureSetting('template.js'), this.data);
    this.registerListeners();
}

/**
 * Restore the this.data.form from an object (GET) and add "value" to all "fields" (only for render form.js)
 * If "field" exist in Settings but not in "values", will use "defaultValue"
 * @param {Object} values Values to restore (GET or other object)
 */
App.prototype.restoreForm = function(values) {
    var fields = this.getSignatureSetting('fields');
    for (var n = 0; n < fields.length; n++) {
        var fieldName = fields[n].name;
        if (typeof values[fieldName] === "undefined") {
            values[fieldName] = fields[n].defaultValue;
        }

        // Set value to restore form (can't access directly to "form" in mustache when "fields" is looping)
        fields[n].value = values[fieldName];
    }
    this.data.form = values;
}

/**
 * Return the correct method to use imageURL() depending of standalone method
 * If standalone, it will incrustate the image in base64 instead a normal src link
 */
App.prototype.getImageLinkMethod = function(data) {
    // Load behaviour depending Settings.js
    var method = (this.isStandalone(data)) ? data.imageURLStandalone : data.imageURLNormal;
    if (!method) method = this.getMethodLinkDefault(data);

    return method;
}

/**
 * Get a default behavior to show URLs (as link or incrustanted/standalone)
 * @param {*} data 
 */
App.prototype.getMethodLinkDefault = function(data) {
    // Not specified methods in Settings
    var methodToUse = (this.isStandalone(data)) ? APP.urlStandalone : APP.urlAsLink;
    return function() {
        return methodToUse;
    };
}

/**
 * Check if data is in standalone mode or not
 * @param {*} data 
 */
App.prototype.isStandalone = function(data) {
    return (data.standaloneMode === 0 && data.form.standalone || data.standaloneMode === 2);
}

/**
 * Set signature content
 * @param {string} content Content to show in HTML format
 */
App.prototype.setSignature = function(content) {
    return document.getElementById(SIGNATURE_CONTENT_ID).innerHTML = content;
}
//#endregion


// Export for requireJS
if (typeof define !== "undefined") {
    define(function() {
        return App;
    });
}