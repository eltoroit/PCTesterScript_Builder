({
	doInit: function (component, event, helper) {
		var action = component.get("v.action");
		var field = component.get("v.field");
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

		component.set("v.class", css);
		component.set("v.value", value);
		component.set("v.fieldName", fieldName);
	},
	changeValue: function (component, event, helper) {
		var value = component.get("v.value");
		var action = component.get("v.action");
		var field = component.get("v.field");
		var fieldName = field.name;
		action[fieldName] = value;
	}
})