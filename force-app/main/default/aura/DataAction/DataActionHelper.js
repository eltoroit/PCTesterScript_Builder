({
	handleRecordUpdated: function (component, helper, eventParams) {
		console.log(JSON.parse(JSON.stringify(eventParams)));
		if (eventParams.changeType === "LOADED") {
			var action = component.get("v.action");
			var operation = action.Operation__c;
			var fieldsShown = component.get("v.fields")[operation];
			var EventsPerAllActions = component.get("v.EventsPerAllActions");
			component.set("v.fieldsShown", fieldsShown);
			component.set("v.selectedEvents", EventsPerAllActions[action.Id]);

			var event = component.getEvent("register");
			event.setParams({
				data: {
					Id: action.Id,
					lds: component.find("recordManager")
				}
			});
			event.fire();
		} else if (eventParams.changeType === "CHANGED") {
			var action = component.get("v.action");
			console.log('Fields that are changed: ' + JSON.stringify(eventParams.changedFields));

			/*
			var eventIds = component.find("events").get("v.value");
			component.set("v.selectedEvents", eventIds);
			var event = component.getEvent("saveEvents");
			event.setParams({
				data: {
					actionId: action.Id,
					cmp: component,
					eventIds: eventIds
				}
			});
			event.fire();
			*/
			var event = component.getEvent("saveEvents");
			event.setParams({
				data: {
					actionId: action.Id
				}
			});
			event.fire();
		} else if (eventParams.changeType === "REMOVED") {
			// record is deleted
		} else if (eventParams.changeType === "ERROR") {
			// there’s an error while loading, saving, or deleting the record
			alert("ERROR SAVING RECORD")
		}
	},
	saveRecord: function (component, helper) {
		component.find("recordManager").saveRecord(
			$A.getCallback(function (saveResult) {
				console.log(JSON.parse(JSON.stringify(saveResult)));
				// NOTE: If you want a specific behavior(an action or UI behavior) when this action is successful 
				// then handle that in a callback (generic logic when record is changed should be handled in recordUpdated event handler)
				if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
					// handle component related logic in event handler
					component.find("recordManager").reloadRecord();
				} else if (saveResult.state === "INCOMPLETE") {
					alert("User is offline, device doesn't support drafts.");
				} else if (saveResult.state === "ERROR") {
					alert('Problem saving record, error: ' + JSON.stringify(saveResult.error));
				} else {
					alert('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
				}
				component.set("v.isEditing", false);
			})
		);
	},
	reorder: function (component, eventData) {
		var action = component.get("v.action");

		eventData.idx = component.get("v.idx");
		eventData.action = action;

		var event = component.getEvent("reorder");
		event.setParams({
			data: eventData
		});
		event.fire();
	}
})