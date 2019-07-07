({
    doInit: function (component, event, helper) {
        var fields = {
            "All": ["Id", "Name", "AppName__c", "Command__c", "EnabledAction__c", "Expected__c", "ErrorMessage__c", "Fix__c", "Message__c", "Operation__c", "Order__c"],
            "Common": ["Id", "Name", "EnabledAction__c", "Operation__c", "Order__c"],
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
                { name: "Fix__c", required: false },
            ],
            "Clear": [
                { name: "AppName__c", required: false }
            ],
            "JSON File - Check": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false },
                { name: "JSON_Actions__r", required: true, type: "JSON" }
            ],
            "JSON File - Edit": [
                { name: "AppName__c", required: true },
                { name: "Command__c", required: true },
                { name: "Expected__c", required: true },
                { name: "Fix__c", required: false },
                { name: "JSON_Actions__r", required: true, type: "JSON" }
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
    }
})