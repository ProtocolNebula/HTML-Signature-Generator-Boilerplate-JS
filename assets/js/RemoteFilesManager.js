/**
 * This class will manage (and cache) remote files
 */
const RemoteFilesManager = function() {
    /**
     * list with all elements requested.
     * If file is pending load, its value will be "null", if can't be loaded, will be "false"
     * If you re-request a "false" or "null" file, a new petition will be launched.
     */
    this.cachedFiles = {};
}

/**
 * Get a remote file via GET using AJAX
 * @link https://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
 * @param {string} url URL to retrieve
 * @param {*} callback Function to process the result
 * @param {number} retry Total retries if fail (timeout or error)
 * @param {*} callbackError Function to process if error (no more retries or retry=0)
 * @example 
 *  cacheFile.getFile('https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0', function(dataUrl) {
 *      console.log('RESULT:', dataUrl);
 *  })
 * @returns {string|null} If file is already in cache, it will return the string of file
 */
CacheFiles.prototype.getFile = function (url, callback, retry, callbackError) {
    if (this.cachedFiles[url]) {
        return this.cachedFiles[url];
    }

    // Put file status in loading
    this.cachedFiles[url] = null;

    try {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(url, reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
    
        // Added by Ruben Arroyo: Minimal error control
        var onError = function (e) {
            if (retry && retry > 0) {
                toDataURL(url, callback, retry - 1);
            } else if (callbackError) {
                this.cachedFiles[url] = false; // ERROR LOADING FILE
                callbackError(e);
            }
        };
    
        xhr.ontimeout = onError;
        xhr.addEventListener('error', onError);
        // xhr.addEventListener('abort', onError);
    
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    } catch (e) {
        // Added by Ruben Arroyo: Minimal exception control
        console.error(e);
        if (callbackError) {
            callbackError(e);
        }
    }
}


CacheFiles.prototype.allFilesLoaded