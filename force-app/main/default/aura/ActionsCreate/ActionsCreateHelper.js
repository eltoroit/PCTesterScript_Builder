({
    showDiv: function (component, isVisible) {
        if (isVisible) {
            $A.util.removeClass(component, "slds-hide");
        } else {
            $A.util.addClass(component, "slds-hide");
        }
    },

    operationChanged: function (component, helper) {
        var operation = component.find("operation").get("v.value");
        if (operation) {
            helper.showDiv(component.find("showFields"), true);
            helper.showDiv(component.find("showAppName"), true);
            helper.showDiv(component.find("showCommand"), true);
            helper.showDiv(component.find("showExpected"), true);
            helper.showDiv(component.find("showFix"), true);
            if ((operation === "Check Contains") || (operation === "Check Exact") || (operation === "Check Path")) {
                helper.showDiv(component.find("showFix"), false);
            } else if (operation === "Clear") {
                helper.showDiv(component.find("showAppName"), false);
                helper.showDiv(component.find("showCommand"), false);
                helper.showDiv(component.find("showExpected"), false);
                helper.showDiv(component.find("showFix"), false);
            } else if ((operation === "Edit JSON File")) {
                helper.showDiv(component.find("showExpected"), false);
                helper.showDiv(component.find("showFix"), false);
            } else if ((operation === "Manual")) {
                helper.showDiv(component.find("showExpected"), false);
                helper.showDiv(component.find("showFix"), false);
            } else if ((operation === "Open Application")) {
                helper.showDiv(component.find("showExpected"), false);
                helper.showDiv(component.find("showFix"), false);
            } else if ((operation === "Write")) {
                helper.showDiv(component.find("showExpected"), false);
                helper.showDiv(component.find("showFix"), false);
            } else {
                alert("DO NOT KNOW HOW TO HANDLE: " + operation);
            }
        } else {
            helper.showDiv(component.find("showFields"), false);
        }
    },

    initializeData: function (component, helper) {
        helper.multiSelect_AllEvents(component, helper);
        helper.multiSelect_SelectedEvents(component, helper);
    },

    multiSelect_AllEvents: function (component, helper) {
        var apexBridge = component.find("ApexBridge");

        apexBridge.callApex({
            component: component,
            request: {
                controller: "ActionCreate",
                method: "getAllEvents"
            },
            callBackMethod: function (response) {
                var events = response.output;
                var options = [];
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    options.push({
                        value: event.Id,
                        label: event.Name
                    })
                }
                component.set("v.allEvents", options);
            }
        });
    },

    multiSelect_SelectedEvents: function (component, helper) {
        var apexBridge = component.find("ApexBridge");

        apexBridge.callApex({
            component: component,
            request: {
                controller: "ActionCreate",
                method: "getSelectedEvents",
                input: {
                    actionId: component.get("v.recordId")
                }
            },
            callBackMethod: function (response) {
                var events = response.output;
                if (events.length > 0) {
                    component.set("v.selectedEvents", events);
                } else {
                    component.set("v.selectedEvents", []);
                }
            }
        });
    }
})