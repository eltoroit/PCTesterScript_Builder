({
	fireEvent: function (component, eventData) {
		eventData.idx = component.get("v.idx");
		eventData.action = component.get("v.action");

		var event = component.getEvent("actionEvent");
		event.setParams({
			data: eventData
		});
		event.fire();
	}
})