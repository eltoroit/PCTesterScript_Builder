({
	doInit: function (component, event, helper) {
		var action = component.get("v.action");
		var operation = action.Operation__c;
		var fieldsShown = component.get("v.fields")[operation];
		component.set("v.fieldsShown", fieldsShown);
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
		var action = component.get("v.action");
		/*
		var navEvt = $A.get("e.force:editRecord");
		navEvt.setParams({
			"recordId": action.Id
		});
		navEvt.fire();
		*/
		$A.createComponents(
			[
				["c:ActionsEditOne", { recordId: action.Id, isForm: true }],
				["c:ActionsEditOne", { isForm: false }]
			],
			function (components, status) {
				if (status === "SUCCESS") {
					var modalEditForm = components[0];
					var modalButtons = components[1];
					component.find('overlayLib').showCustomModal({
						header: "Editing Action",
						body: modalEditForm,
						footer: modalButtons,
						showCloseButton: true,
						closeCallback: function () {
							helper.fireEvent(component, { refresh: true }); // Just save to reload... For now. This could be improved, since no need to save to reload!
						}
					}).then(function (modalWindow) {
						modalButtons.set("v.modalWindow", modalWindow);
						modalEditForm.set("v.modalWindow", modalWindow);
					});
					modalButtons.set("v.editForm", modalEditForm);
				}
			}
		);
	},
	moveUp: function (component, event, helper) {
		helper.fireEvent(component, { direction: -1 });
	},
	moveDown: function (component, event, helper) {
		helper.fireEvent(component, { direction: +1 });
	},
	changeEnabled: function (component, event, helper) {
		var curEnabled = component.get("v.action").EnabledAction__c;
		helper.fireEvent(component, { enabled: !curEnabled });
	},
	test: function (component, event, helper) {
		debugger;
	}
})