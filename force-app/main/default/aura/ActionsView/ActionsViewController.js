({
	doInit: function (component, event, helper) {
		helper.retrieveEvents(component, event, helper);
	},
	onEventChange: function (component, event, helper) {
		helper.retrieveActions(component, event, helper);
	},
	actionEvent: function (component, event, helper) {
		helper.handleActionEvent(component, event, helper);
	}
})