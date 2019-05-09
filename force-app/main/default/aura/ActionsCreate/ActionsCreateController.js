({
	init: function (component, event, helper) {
		helper.initializeData(component, helper);
	},
	handleChange: function (component, event, helper) {
		// This will contain an array of the "value" attribute of the selected options
		var selectedOptionValue = event.getParam("value");
		alert("Option selected with value: '" + selectedOptionValue.toString() + "'");
	},
	operationChanged: function (component, event, helper) {
		helper.operationChanged(component, helper);
	},
	onsubmit: function (component, event, helper) {

	},
	onsuccess: function (component, event, helper) {
		console.log(event.getParams().response);
		var navEvt = $A.get("e.force:navigateToSObject");
		navEvt.setParams({
			"recordId": event.getParams().response.id,
			"slideDevName": "detail"
		});
		navEvt.fire();
	},
	onload: function (component, event, helper) {
		helper.operationChanged(component, helper);
	},
	onerror: function (component, event, helper) {
		console.log(event.getParams().error);
		debugger;
	}
})