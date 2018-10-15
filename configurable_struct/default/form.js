define(function () {
return `
    {{#fields}}
        <div class="form-group row">
            <label for="input_{{name}}" class="col-sm-3 col-form-label">{{displayText}}</label>
            <div class="col-sm-9">
                <input 
                    id="input_{{name}}" 
                    name="{{name}}" 
                    type="{{type}}" 
                    value="{{value}}" 
                    placeholder="{{displayText}}" 
                    class="form-control" />  
            </div>
        </div>
    {{/fields}}

    {{!Show standalone checkbox if standaloneMode is 0}}
    {{^standaloneMode}} 
        <div class="form-group form-check">
            <input type="checkbox" class="form-check-input" id="input_standalone" name="standalone" {{#form.standalone}}checked="checked"{{/form.standalone}} />
            <label class="form-check-label" for="input_standalone">Standalone: Insert images in the signature (mail sizes will be bigger)</label>
        </div>
    {{/standaloneMode}} 
`;
});