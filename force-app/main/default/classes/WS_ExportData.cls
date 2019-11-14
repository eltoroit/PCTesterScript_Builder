@RestResource(urlMapping='/WS_ExportData/*')
global with sharing class WS_ExportData {
    @HttpGet
    global static AppData getJsonData() {
        return new AppData();
    }

    global class AppData {
		global DateTime now { get; set; }
        global List<Event__c> events { get; set; }
        global Map<String, List<Action__c>> actionsByEvent = null; //  { get; set; }

        public AppData() {
			now = Datetime.now();
            actionsByEvent = new Map<String, List<Action__c>>();
            events = [SELECT ID, Name, Order__c FROM Event__c WHERE ActiveEvent__c = true ORDER BY Order__c];
            for (Event__c event : events) {
                actionsByEvent.put(event.Id, Util.findActions(null, event));
            }
        }

        private static List<Action__c> findActions(String criteriaSOQL, Event__c event) {
        String SOQL;
        String eventId = event.Id;

        SOQL = 'SELECT Id, Name, ';
        SOQL += getFieldsCustom('Action__c') + ', ';
        SOQL += '(SELECT ID, Name, ' + getFieldsCustom('JSON_Action__c') + ' FROM JSON_Actions__r) ';
        SOQL += 'FROM Action__c WHERE EnabledAction__c = true ';
        if (criteriaSOQL != null)  SOQL += 'AND (' + criteriaSOQL + ') ';
        SOQL += 'AND Id IN (SELECT Action__c FROM Event_X_Action__c WHERE Event__c = :eventId) ';
        SOQL += 'ORDER BY Order__c ASC ';
        System.debug(SOQL); 
        return  Database.query(SOQL);
    }
    }
}