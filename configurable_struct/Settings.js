/**
 * Default settings for application
 * This will be load dinamically with "require.js".
 */
var SETTINGS = {
    /**
     * This contain all folders that contain different signature types, if only one, selector will be hidden.
     * 
     * Load process for each setting: 
     * 1 - Try to load file from directory
     * 2 - If some file not exist will be load from the main folder (first configurable folder) (only missing files)
     * 3 - If main folder have no the corresponding file, will be load from "configurable_struct/default"
     */
    signatures: {
        default: {
            name: 'Default'
        },
        advanced: {
            name: 'advanced',
        }
    },
};

