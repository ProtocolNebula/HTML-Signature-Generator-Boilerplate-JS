/**
 * Load all libs required to work
 * NOTE THAT THIS CAN BE OUT OF DATE
 * 
 * HOW TO MAKE THIS WORK:
 *  - Goto index.html
 *  - Uncomment "<script data-main="./assets/js/loader" src="assets/js/vendor/require.js"></script>"
 *  - Comment all "<script>" under that line
 */
var errorShown = false;
requirejs([
    // Settings files
    './configurable/form.js',
    './configurable/middleware.js',
    './configurable/settings.js',
    './configurable/template.js',
], function (...loadedElements) {
    initApp();
}, function (err) {
    console.error('FILE NOT FOUND or ERROR ON PROCESS:' , err);

    // Load the default settings (configurable struct)
    if (!errorShown) {
        errorShown = true;
        // RequireJS configurable struct
        requirejs([
            // Settings files
            './configurable_struct/form.js',
            './configurable_struct/middleware.js',
            './configurable_struct/settings.js',
            './configurable_struct/template.js',
        ], function (...loadedElements) {
            alert("SETTINGS loaded from 'configurable_struct'. Please, check 'configuration' folder if you are not in DEMO mode.")
            initApp();
        }, function (err) {
            console.error('FILE NOT FOUND or ERROR ON PROCESS:' , err);
            alert('Can\'t load app due a file SETTINGS loading error. Please, check the console log.');
        });
    }
});

function initApp() {
    // Instantiate the app
    APP = new App(SETTINGS, SIGNATURE_TEMPLATE);
    APP.init();
}