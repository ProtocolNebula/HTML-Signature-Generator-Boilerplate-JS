/*
 Here are the functions hooks to manipulate data response 
 and other things to avoid edit base app
 */

/**
 * This function is called before process template.js signature
 * @param {*} args Args that will be send to "template.js" and will be processed by mustache
 * @returns {*} Must return the final "args" to process
 */
function preGenerateSignature(args) {
    // Here your custom args manipulation
    // console.log(args);

    // End custom args

    return args;
}

/**
 * This function is called after process template.js signature
 * @param {string} template The processed template HTML
 * @returns {string} Must return the final "args" to process
 */
function postGenerateSignature(template) {
    // Here your custom template manipulation
    // Console.log(template);

    // End custom template manipulation
    
    return template;
}