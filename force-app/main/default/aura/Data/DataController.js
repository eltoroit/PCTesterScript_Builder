({
	doInit: function (component, event, helper) {
		component.set("v.mapLds", {});
		helper.fieldsData(component, helper);
		helper.retrieveEvents(component, helper);
		helper.retrieveEventsPerAllActions(component, helper);
	},
	refresh: function (component, event, helper) {
		component.set("v.isLoaded", false);
		helper.retrieveActions(component, helper);
	},
	reorder: function (component, event, helper) {
		component.set("v.isLoaded", false);
		helper.reorder(component, helper, event.getParams().data);
	},
	registerLds: function (component, event, helper) {
		var data = event.getParams().data;
		var mapLds = component.get("v.mapLds");
		mapLds[data.Id] = data.lds;
		component.set("v.mapLds", mapLds);
	},
	onEventChange: function (component, event, helper) {
		helper.retrieveActions(component, helper);
	},
	saveEvents: function (component, event, helper) {
		helper.saveEvents(component, helper, event.getParams().data);
	}
})