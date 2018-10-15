/**
 * This file will load all settings or default if not settings available
 */

var LOADER_SETTINGS_HELPER = {
    configurable_default_folder: 'configurable_struct',
    configurable_folder: 'configurable',
    configurable_default_folder: 'default',
    /**
     * Try to require a file from configurable_folder, if not found, will load from configurable_default_folder
     * ONLY ONE FILE PER CALL
     * @param {string} templateName Template name (folder under settings/)
     * @param {string} file File to load
     * @param {string} callback Callback if success, will receive 3 parameters: directoryConfig, templateName, file
     */
    requireOr: function(templateName, file, callback) {

        var fileToInclude = templateName + '/' + file;

        requirejs([
            './' + LOADER_SETTINGS_HELPER.configurable_folder + '/' + fileToInclude
        ], 
        function () {
            // SUCCESS
            callback(LOADER_SETTINGS_HELPER.configurable_folder, templateName, file);
        },
        function () {
            // ERROR, try to load from default folder
            requirejs([
                './' + LOADER_SETTINGS_HELPER.configurable_default_folder + '/' + fileToInclude
            ], function() {
                // ALTERNATIVE SUCCESS
                console.warn('File ', fileToInclude, ' loaded from ', LOADER_SETTINGS_HELPER.configurable_default_folder);
                callback(LOADER_SETTINGS_HELPER.configurable_default_folder, templateName, file);
            }, function(err) {
                console.error('FILE NOT FOUND or ERROR ON PROCESS:' , err);
            });

        });
    },
}

 // Load default settings (even no settings loaded yet)
loadDefaultSettings();

// include settings.js file and include the other files
LOADER_SETTINGS_HELPER.requireOr('', 'Settings.js', function(directoryConfig, templateName, file) {
    if (directoryConfig === LOADER_SETTINGS_HELPER.configurable_default_folder) {
        alert("SETTINGS loaded from 'configurable_struct'. Please, check 'configuration' folder if you are not in DEMO mode.");
    }

    var templates = Object.keys(SETTINGS);
    var files = [];
    for (let n = 0; n < templates.length; n++) {
        // Load all files from every template.
        // THIS MUST DO THE REQUIRE PROCESS AND CALL initApp()
        files.push(getAllFilesFor(directoryConfig, templates[n]));
    }
});


function loadDefaultSettings() {
    var files = loadAllSettings(LOADER_SETTINGS_HELPER.configurable_default_folder, LOADER_SETTINGS_HELPER.configurable_default_folder);
}

/**
 * 
 * @param {*} directoryConfig Directory of settings (configurable, configurable_settings)
 * @param {*} templateName name of folder (signature) to load under configurable/, ex: default
 * @return {array} List of files to include
 */
function getAllFilesFor(directoryConfig, templateName) {
    var files = [];
    // prepare an array of files that point to the requested folder

    return files;
}

/**
 * Init the app once successfully load
 */
function initApp() {
    if (APP) return;

    // Check if the main template is fully loaded
    
    // Instantiate the app
    APP = new App(SETTINGS, SIGNATURE_TEMPLATE);
    APP.init();
}