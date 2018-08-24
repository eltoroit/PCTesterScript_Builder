({
	doInit: function (component, event, helper) {
	},
	handleRecordUpdated: function (component, event, helper) {
		helper.handleRecordUpdated(component, helper, event.getParams());
	},
	changeEnabled: function (component, event, helper) {
		var action = component.get("v.action");
		action.Enabled__c = !action.Enabled__c;
		helper.saveRecord(component, helper);
	},
	viewRecord: function (component, event, helper) {
		var action = component.get("v.action");
		var navEvt = $A.get("e.force:navigateToSObject");
		navEvt.setParams({
			"recordId": action.Id,
			"slideDevName": "details"
		});
		navEvt.fire();
	},
	editRecord: function (component, event, helper) {
		component.set("v.isEditing", true);
	},
	saveRecord: function (component, event, helper) {
		helper.saveRecord(component, helper);
	},
	moveUp: function (component, event, helper) {
		helper.reorder(component, { direction: -1 });
	},
	moveDown: function (component, event, helper) {
		helper.reorder(component, { direction: +1 });
	},
})