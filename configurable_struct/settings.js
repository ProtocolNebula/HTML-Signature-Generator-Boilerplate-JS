/**
 * This will be used to generate automatically the form, use current fields or example configurable fields to generate new ones
 * 
 * TIP: If you need custom results, edit "middleware.js"
 * FUTURE DESIRED IMPROVEMENT: If you need a custom form, you can edit "assets/js/templates/form.js", all elements that you add will be automatically read from app witouth need to add here.
 * 
 * This is a non-developer skills/fast development helper
 * 
 * EX: `Name: {{form.name}}, {{form.lastName}}`
 */
var FORM_FIELDS = {
    /**
     * This setting will manage the method to add images in signature
     *  0: User can choose the method
     *  1: Images will show as URL linked to signature server via http
     *  2: Images will base64 encoded and added as source in the html (stand-alone mode)
     */
    standaloneMode: 1, // WIP, CURRENTLY ONLY "1" is working

    /**
     * This contain all fields to show/restore
     */
    fields: [
        {
            name: 'name', // Will be used as var name (key)
            displayText: 'Full Name',
            defaultValue: '',
            type: 'string', // "type" input (if hidden = false)
        },
        {
            name: 'professionalCategory',
            displayText: 'Professional Category',
            defaultValue: 'Full Stack Senior',
            type: 'string',
        },
        {
            name: 'phone',
            displayText: 'Phone',
            defaultValue: '+34 ',
            type: 'string',
        },
        {
            name: 'email',
            displayText: 'Email',
            defaultValue: '@mycompany.com',
            type: 'string',
        }
    ]
};

/**
 * This will be merged with FORM_FIELDS result before process the template.
 * You can use custom mustache.js syntax (arrays, functions...)
 * You are free to add/remove all fields, but remember to change it in "template.js"
 * EX: `Company Name: {{companyInfo.name}}`
 * 
 * IMPORTANT: This will be merged with all form elements into "form" property.
 * You can use "console.log(this)" to see what are you receiving
 * 
 * https://github.com/janl/mustache.js/
 */
var ADDITIONAL_INFO = {
    companyInfo: {
        name: 'CompanyName',
        websiteText: 'racs.es', // Text to show on website URL
        website: 'https://racs.es', // URL to link
        direction: {
            street: 'Street Example',
            city: 'Example City',
            province: 'Barcelona',
            postalCode: '000000'
        }
    },
    socialNetworks: {
        github: 'http://github.com/ProtocolNebula',
        facebook: 'https://www.facebook.com/YOURFBPAGE',
        twitter: 'https://wwww.twitter.com/YOURCOMPANYTWITTER',
        instagram: 'https://www.instagram.com/YOURINSTAGRAMPAGE/',
        linkedin: 'https://www.linkedin.com/YOURLINKEDINURL/',
    },
    sizes: {
        socialNetworksIcons: '25px',
    },

    urlPhone: function() {
        return replaceAll(this.form.phone, ' ', '');
    },

    imageURL: function(url) {}, // Will setted automatically depending if standalone or no

    /**
     * Normal mode image
     */
    imageURLNormal: function() {
        return function(url, render) {
            console.log('normal');
            return render(url);
        }
    },
    
    /**
     * Standalone mode
     */
    imageURLStandalone: function(url) {
        return function(url, render) {
            console.log('normal');
            return render(url);
        }
    }
    
};