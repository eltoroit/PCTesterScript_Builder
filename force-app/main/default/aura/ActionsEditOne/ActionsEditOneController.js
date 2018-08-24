({
	saveRecord: function (component, event, helper) {
		component.find("edit").get("e.recordSave").fire();
	},
	closeModal: function (component, event, helper) {
		var modalWindow = component.get("v.modalWindow");
		modalWindow.close();
	},
	saveClick: function (component, event, helper) {
		var formCmp = component.get("v.editForm");
		formCmp.saveRecord();
	}
})