({
    doInit: function (component, event, helper) {
        var action = component.get("v.action");
        var field = component.get("v.field");
        var isJSON = (field.type && field.type == "JSON");

        var fieldName = field.name;
        var value = action[fieldName];

        var isRequired = field.required;
        var css = 'sideContent';
        if (!value) {
            if (isRequired) {
                css += ' sideMissing';
            } else {
                css += ' sideMissingOptional';
            }
        }

        if (isJSON) { 
            console.log("action: ", JSON.parse(JSON.stringify(action)));
            console.log("field: ", field);
            value = action.JSON_Actions__r.records[0];
        }
        
        component.set("v.isJSON", isJSON);
        component.set("v.class", css);
        component.set("v.value", value);
        component.set("v.fieldName", fieldName);
    }
})