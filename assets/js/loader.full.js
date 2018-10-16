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
    // External files with "manual" export
    './assets/js/vendor/mustache.min.js',
    
    // Main files
    './assets/js/configurable/Settings.js',
    './assets/js/RemoteFilesManager.js', 
    './assets/js/helpers.js',
    './assets/js/app.js',
    
    // Main loader (settings and app init)
    './assets/js/loaderSettings.js',
], function (...loadedElements) {
    // Set global elements if not auto-loading with requirejs
    window.Mustache = loadedElements[0];
}, function (err) {
    console.error(message, err);
    if (!errorShown) {
        alert('Can\'t load app due a file loading error.');
        errorShown = true;
    }
});