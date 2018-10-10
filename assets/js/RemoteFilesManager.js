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
 * @param {*} callback Function to process the result IF FILE IS NOT ALREADY LOADED
 * @param {number} retry Total retries if fail (timeout or error)
 * @param {*} callbackError Function to process if error (no more retries or retry=0)
 * @example 
 *  cacheFile.getFile('https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0', function(dataUrl) {
 *      console.log('RESULT:', dataUrl);
 *  })
 * @returns {string|false|null} If file is already in cache, it will return the string of file or false if was a loading error
 */
RemoteFilesManager.prototype.getFile = function (url, callback, retry, callbackError) {
    if (this.cachedFiles[url] !== undefined && this.cachedFiles[url] !== null) {
        return this.cachedFiles[url];
    }

    // Put file status in loading
    if (this.cachedFiles[url] === undefined) {
        this.cachedFiles[url] = null;
    }

    try {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                var result = reader.result || false;
                this.cachedFiles[url] = result;
                callback(url, result);
            }.bind(this);
            reader.readAsDataURL(xhr.response);
        }.bind(this);
    
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


/**
 * Check if all files are ready (!== null)
 */
RemoteFilesManager.prototype.allFilesLoaded = function() {
    var keys = Object.keys(this.cachedFiles);

    for (n = 0; n < keys.length; n++) {
        var element = this.cachedFiles[keys[n]];
        if (element == null) return false;
    }
    return true;
}

/**
 * Set all "false" (error) elements to "null"
 */
RemoteFilesManager.prototype.resetErrorFiles = function() {
    Object.keys(this.cachedFiles).forEach(function(key) {
        if (this.cachedFiles[key] == null) this.cachedFiles[key] = null;
    })
}