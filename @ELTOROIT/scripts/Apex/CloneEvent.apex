Id newEvent = 'a029A000001UqouQAC';
Id originalEvent = 'a029A000001UqjrQAC';
List<Event_X_Action__c> originalExA = [
	SELECT Id, Action__c, Name
	FROM Event_X_Action__c
	WHERE Event__c = :originalEvent
];
List<Event_X_Action__c> newExA = originalExA.deepClone();
for (Event_X_Action__c ExA : newExA) {
	ExA.Event__c = newEvent;
	ExA.UniqueKey__c = ExA.Action__c + '-' + newEvent;
}
insert newExA;
