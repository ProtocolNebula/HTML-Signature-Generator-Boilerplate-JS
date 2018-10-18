/**
 * This file will load all settings or default if not settings available
 */
var LoaderSettings = function() {
    this.configurable_folder = 'configurable';
    this.signatures_folder = 'configurable/signatures/';
    this.default_signature = 'default';

    /**
     * Main files for signatures (if not exist, will readed from "default")
     */
    this.signature_files = [
        'form.js',
        'middleware.js',
        'settings.js',
        'template.js',
        'template2.js',
    ];

    // This will contain processde content of loaded files.
    // Files must be requirejs compatible (see any from default as example)
    this.loadedFiles = {};

    try {
        this.main_signature = SETTINGS.signatures[0];
        if (!this.main_signature) {
            var errorMSG = "FATAL ERROR: ¡¡¡No signature found on Settings file!!!";
            alert(errorMSG);
            throw errorMSG;
        }
    } catch (ex) {
        alert('Error reading Settings.js: ' + ex);
        throw ex;
    }
}

/**
 * Check if all files provided via "files" are in "loadedFiles" (key exist and is not null)
 */
LoaderSettings.prototype.allFilesLoaded = function(files) {
    var filesLoaded = this.loadedFiles;
    for (n = 0; n < files.length; n++) {
        if (filesLoaded[n] === undefined || filesLoaded[n] === null) {
            return false;
        }
    }

    return true;
},

/**
 * Require all JS files from specified signature and launch "callback".
 * @param {string} template Name of Signature to load
 * @param {*} callbackEnd Callback calle once all files are processed
 * @param {boolean} loadFromDefault If true and file not found, this will use "default" template file (only for errored files)
 */
LoaderSettings.prototype.requireAll = function(template, callbackEnd, loadFromDefault) {
    var files = this.getAllFilesFor(template, files);
    console.log(files);
    requirejs(files, 
    function (...loadedContent) {
        // Set content loaded into loaded files (if no data received, will set "false" to avoid null)
        for (var n = 0; n < files.length; n++) {
            var currentFile = files[n];
            this.loadedFiles[currentFile] = loadedContent[currentFile] || false;
        }

        if (callbackEnd) {
            callbackEnd();
        } 
    },
    function(data) {
        console.log('File not loaded: ' , data);
        // Error
        if (loadFromDefault) {
            this.loadedFiles[currentFile]
        }

        console.log('Template: ' , template, ' full loaded? ' , this.allFilesLoaded(files) );
        if (callbackEnd && this.allFilesLoaded(files)) {
            callbackEnd();
        }
    });
}

/**
 * Load the main template, once end, it will load other templates
 * After all process end (or the main template is fully loaded), it will init the app
 */
LoaderSettings.prototype.init = function() {
    this.requireAll(
        this.default_signature, 
        this.loadTemplates.bind(this)
    );
}

LoaderSettings.prototype.loadTemplates = function() {
    var signaturesToLoad = cloneObject(SETTINGS.signatures);    
    var callback = this.initApp;
    var totalSignatures = signaturesToLoad.length;

    if (totalSignatures === 0) {
        // Force default signature if no signatures
        signaturesToLoad = [ this.default_signature ];
    }

    if (totalSignatures < 2 && signaturesToLoad[0] === this.default_signature) {
        callback();
        return;
    }

    for (var fileIndex = 0; fileIndex < totalSignatures; fileIndex++) {
        var signature = signaturesToLoad[fileIndex];

        // Skip the main template
        if (signature !== this.default_signature) {
            this.requireAll(signature, callback, true);
            if (callback) callback = null; // Callback is only applicable to the main signature
        }
        
    }
}

/**
 * 
 * @param {*} templateName name of folder (signature) to load under configurable/, ex: default
 * @return {array} List of files to include
 */
LoaderSettings.prototype.getAllFilesFor = function(templateName) {
    var templateFolder = this.signatures_folder + templateName + '/';
    var signatureFiles = this.signature_files;
    
    var files = [];
    for (n = 0; n < signatureFiles.length; n++) {
        var file = signatureFiles[n];
        files.push(templateFolder + file);
    }

    return files;
}

/**
 * Init the app once successfully load
 */
LoaderSettings.prototype.initApp = function() {
    console.log('init app called');
    if (APP) return;
    
    console.log('initing app');
    // Check if the main template is fully loaded
    
    // Instantiate the app
    APP = new App(SETTINGS);
    APP.init();
    APP.addSignature()

    console.log('inited app');
}


// Load default settings (even no settings loaded yet)
new LoaderSettings().init();