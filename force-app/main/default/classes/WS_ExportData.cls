@RestResource(urlMapping='/WS_ExportData/*')
global with sharing class WS_ExportData {
	@HttpGet
	global static etAppData getJsonData() {
		return new etAppData();
	}

	global class etAppData {
		global DateTime now { get; set; }
		global List<Event__c> events { get; set; }
		global Map<String, List<Action__c>> actionsByEvent { get; set; }

		public etAppData() {
			Map<Id, List<Action__c>> tempMap = new Map<Id, List<Action__c>>();

			now = Datetime.now();

			// Get data
			events = new List<Event__c>();
			for (Event__c event : [SELECT ID, Name, Order__c, ActiveEvent__c FROM Event__c ORDER BY Order__c]) {
				if (event.ActiveEvent__c) {
					events.add(event);
				}
				tempMap.put(event.Id, findActions(null, event));
			}

			// Expand lists
			for (Id eventId : tempMap.keyset()) {
				tempMap.put(eventId, getActions(eventId, tempMap));
			}

			actionsByEvent = new Map<String, List<Action__c>>();
			for (Event__c event : events) {
				if (event.ActiveEvent__c) {
					actionsByEvent.put(event.Id, tempMap.get(event.Id));
				}
			}
		}

		private List<Action__c> getActions(Id eventId, Map<Id, List<Action__c>> tempMap) {
			List<Action__c> output = new List<Action__c>();
			for (Action__c action : tempMap.get(eventId)) {
				if (action.Operation__c == 'Include Event') {
					output.addAll(getActions(action.Trailhead_Event__c, tempMap));
				} else {
					output.add(action);
				}
			}
			return output;
		}

		private List<Action__c> findActions(String criteriaSOQL, Event__c event) {
			String SOQL;
			String eventId = event.Id;

			SOQL = 'SELECT Id, Name, ';
			SOQL += Util.getFieldsCustom('Action__c') + ', ';
			SOQL += '(SELECT ID, Name, ' + Util.getFieldsCustom('JSON_Action__c') + ' FROM JSON_Actions__r) ';
			SOQL += 'FROM Action__c WHERE EnabledAction__c = true ';
			if (criteriaSOQL != null)
				SOQL += 'AND (' + criteriaSOQL + ') ';
			SOQL += 'AND Id IN (SELECT Action__c FROM Event_X_Action__c WHERE Event__c = :eventId) ';
			SOQL += 'ORDER BY Order__c ASC ';
			System.debug(SOQL);
			return Database.query(SOQL);
		}
	}
}