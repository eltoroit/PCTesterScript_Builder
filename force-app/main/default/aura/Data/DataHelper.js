({
    fieldsData: function (component, helper) {
        var fields = {
            "All": ["Id", "Name", "AppName__c", "Command__c", "Enabled__c", "Expected__c", "ErrorMessage__c", "Fix__c", "Message__c", "Operation__c", "Order__c"],
            "Common": ["Id", "Name", "Enabled__c", "Operation__c", "Order__c"],
            "Auto": ["ErrorMessage__c", "Message__c"],
            "Check Contains": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Check Exact": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Check Path": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Bookmark": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Clear": [
                { name: "AppName__c", required: false }
            ],
            "Edit JSON File": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true }
            ],
            "Manual": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Open Application": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Fix__c", required: false }
            ],
            "Write": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true }
            ]
        };
        component.set("v.fields", fields);
    },
    retrieveEvents: function (component, helper) {
        var apexBridge = component.find("ApexBridge");
        apexBridge.callApex({
            component: component,
            request: {
                controller: "Data",
                method: "getAllEvents"
            },
            callBackMethod: function (response) {
                var events = response.output;
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    event.value = event.Id;
                    event.label = event.Name;
                }
                if (events.length > 0) {
                    component.set("v.eventId", events[0].Id);
                    component.set("v.events", events);
                    helper.retrieveActions(component, helper);
                } else {
                    component.set("v.eventId", null);
                    component.set("v.events", []);
                }
            }
        });
    },
    retrieveActions: function (component, helper) {
        var apexBridge = component.find("ApexBridge");
        apexBridge.callApex({
            component: component,
            request: {
                controller: "Data",
                method: "getActionsByEvent",
                input: {
                    eventId: component.get("v.eventId")
                },
                forceRefresh: true
            },
            callBackMethod: function (response) {
                helper.handleActionsReturned(component, response);
            }
        });
    },
    retrieveEventsPerAllActions: function (component, helper) {
        var apexBridge = component.find("ApexBridge");
        apexBridge.callApex({
            component: component,
            request: {
                controller: "Data",
                method: "getEventsByAllActions"
            },
            callBackMethod: function (response) {
                component.set("v.EventsPerAllActions", response.output);
            }
        });
    },
    reorder: function (component, helper, eventData) {
        var otherLds, otherAction;
        var updateLds;
        var mapLds = component.get("v.mapLds");

        if (eventData.direction) {
            updateLds = mapLds[eventData.action.Id];
            otherAction = component.get("v.actions")[eventData.idx + eventData.direction];
            otherLds = mapLds[otherAction.Id];
            if ((eventData.direction == -1) || (eventData.direction == +1)) {
                updateLds.get("v.targetFields").Order__c = otherAction.Order__c + (0.1 * eventData.direction);
            } else {
                throw new Error("Value for direction was not expected");
            }
        } else {
            throw new Error("Event data does not have valid data");
        }

        // Update records...
        helper.saveRecord(component, otherLds);
        helper.saveRecord(component, updateLds);
    },
    saveRecord: function (component, lds) {
        lds.saveRecord(
            $A.getCallback(function (saveResult) {
                if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                    lds.reloadRecord();
                }
            })
        );
    },
    handleActionsReturned: function (component, response) {
        var actions = response.output
        if (actions.length > 0) {
            component.set("v.actions", actions);
        } else {
            component.set("v.actions", []);
        }
    },
    saveEvents: function (component, helper, data) {
        var apexBridge = component.find("ApexBridge");
        apexBridge.callApex({
            component: component,
            request: {
                controller: "Data",
                method: "updateEventsByAction",
                input: {
                    actionId: data.actionId,
                    eventIds: data.eventIds
                }
            },
            callBackMethod: function (response) {
                /*
                var EventsPerAllActions = component.get("v.EventsPerAllActions");
                var selectedEvents = data.eventIds;
                EventsPerAllActions[data.actionId] = selectedEvents;
                component.set("v.EventsPerAllActions", EventsPerAllActions);
                data.cmp.set("v.selectedEvents", selectedEvents);
                data.cmp.find("events").set("v.value", selectedEvents);
                */

                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    title: "Saved",
                    type: "Success",
                    message: "The record was updated."
                });
                resultsToast.fire();
            }
        });
    }
})