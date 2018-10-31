/**
 * This file will load all settings or default if not settings available
 */
var LoaderSettings = function() {
    this.configurable_folder = 'configurable';
    this.signatures_folder = 'configurable/signatures/';
    this.default_signature = 'default'; // If you change this, change it in "app.js" too

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
    // Structure: [template]['file.js'] = {Object}
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
LoaderSettings.prototype.allFilesLoaded = function(template, files) {
    var filesLoaded = this.loadedFiles[template];
    for (var n = 0; n < files.length; n++) {
        var file = files[n];
        if (filesLoaded[file] === undefined || filesLoaded[file] === null) {
            return false;
        }
    }

    return true;
},

/**
 * Require all JS files from specified signature and launch "callback".
 * @param {string} template Name of Signature to load
 * @param {*} callbackEnd Callback (called on success and fail for EACH file)
 */
LoaderSettings.prototype.requireAll = function(template, callbackEnd) {
    var files = this.getAllFilesFor(template);
    var self = this;

    this.loadedFiles[template] = {};

    for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let filePath = files[fileIndex];
        let file = this.signature_files[fileIndex];
        
        requirejs(
            [filePath], 
            function (contentFile) {
                self.loadedFiles[template][file] = contentFile;
                
                if (callbackEnd) {
                    callbackEnd(template);
                } 
            },
            function(data) {
                self.loadedFiles[template][file] = false;
                // Error on some load file, check callback end anyways
                if (callbackEnd) {
                    callbackEnd(template);
                }
            }
        );
    }
}

/**
 * Load the main template, once end, it will load other templates
 * After all process end (or the main template is fully loaded), it will init the app
 */
LoaderSettings.prototype.init = function() {
    this.initApp();
    this.requireAll(
        this.default_signature, 
        this.loadTemplates.bind(this)
    );
}

LoaderSettings.prototype.loadTemplates = function() {
    var signaturesToLoad = cloneObject(SETTINGS.signatures);    
    var callback = this.addSignatureLoaded.bind(this);
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
    for (var n = 0; n < signatureFiles.length; n++) {
        var file = signatureFiles[n];
        files.push(templateFolder + file);
    }

    return files;
}

/**
 * Init the app once successfully load
 */
LoaderSettings.prototype.initApp = function() {
    if (APP) return;

    // Instantiate the app
    APP = new App(SETTINGS);
}

/**
 * Add a signature to App if is fully loaded.
 * @param {string} template Template name
 */
LoaderSettings.prototype.addSignatureLoaded = function(template) {
    if (this.allFilesLoaded(template, this.signature_files)) {
        APP.addSignatureSettings(template, this.loadedFiles[template]);
        // if (!APP.inited) {
        //     APP.init();
        // }
    }
}


// Load default settings (even no settings loaded yet)
new LoaderSettings().init();