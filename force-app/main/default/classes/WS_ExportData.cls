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
            events = [SELECT ID, Name, Order__c FROM Event__c WHERE Active__c = true ORDER BY Order__c];
            for (Event__c event : events) {
                actionsByEvent.put(event.Id, Util.findActions(null, event));
            }
        }
    }
}