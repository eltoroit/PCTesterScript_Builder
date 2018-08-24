({
	retrieveEvents: function (component, event, helper) {
		var apexBridge = component.find("ApexBridge");
		apexBridge.callApex({
			component: component,
			request: {
				controller: "ActionsView",
				method: "getEvents"
			},
			callBackMethod: function (response) {
				var events = response.output;
				if (events.length > 0) {
					component.set("v.eventId", events[0].Id);
					component.set("v.events", events);
					helper.retrieveActions(component, event, helper);
				} else {
					component.set("v.eventId", null);
					component.set("v.events", []);
				}
			}
		});
	},
	retrieveActions: function (component, event, helper) {
		var apexBridge = component.find("ApexBridge");
		apexBridge.callApex({
			component: component,
			request: {
				controller: "ActionsView",
				method: "getActions",
				input: {
					eventId: component.get("v.eventId")
				},
				forceRefresh: true
			},
			callBackMethod: function (response) {
				var actions = response.output
				if (actions.length > 0) {
					component.set("v.actions", actions);
				} else {
					component.set("v.actions", []);
				}
			}
		});
	},
	handleActionEvent: function (component, event, helper) {
		var eventData = event.getParams().data;
		var action = eventData.action;
		var apexBridge = component.find("ApexBridge");

		console.log(JSON.parse(JSON.stringify(eventData)));
		if (eventData.direction) {
			var actions = component.get("v.actions");
			var refAction = actions[eventData.idx + eventData.direction];
			if (eventData.direction == -1) {
				action.Order__c = refAction.Order__c - 0.1;
			} else if (eventData.direction == +1) {
				action.Order__c = refAction.Order__c + 0.1;
			} else {
				throw new Error("Value for direction was not expected");
			}
		} else if (eventData.refresh === true) {
			helper.retrieveActions(component, event, helper);
			return;
		} else if (typeof eventData.enabled === 'boolean') {
			action.Enabled__c = eventData.enabled;
		} else {
			throw new Error("Event data does not have valid data");
		}

		apexBridge.callApex({
			component: component,
			request: {
				controller: "ActionsView",
				method: "updateAction",
				records: [action]
			},
			callBackMethod: function (response) {
				helper.retrieveActions(component, event, helper);
			}
		});
	}
})