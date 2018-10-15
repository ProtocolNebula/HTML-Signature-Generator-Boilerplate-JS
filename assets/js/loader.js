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
    // Instantiate the app
    APP = new App(SETTINGS, SIGNATURE_TEMPLATE);
    APP.init();
}, function (err) {
    console.error('FILE NOT FOUND or ERROR ON PROCESS:' , err);
    if (!errorShown) {
        alert('Can\'t load app due a file loading error. Please, check the console log.');
        errorShown = true;
    }
});