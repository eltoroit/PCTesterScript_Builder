public with sharing class ActionsView extends ETLC_ApexBridge_Abstract {
    public override void process(ETLC_ApexBridge_Request request, ETLC_ApexBridge_Response response) {
        if (request.method == 'getEvents') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getEvents(request));
        } else if (request.method == 'getActions') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getActions(request));
        } else if (request.method == 'updateAction') {
            updateAction(request);
            response.output = null;
        } else {
            throw new ETLC_Exception('Unexpected "method" received');
        }
    }

    private List<Event__c> getEvents(ETLC_ApexBridge_Request request) {
        List<Event__c> events = [
            SELECT Id, Name, Active__c 
            FROM Event__c 
            WHERE Active__c = true 
            ORDER BY Name 
        ];
        ETLC_SecuredDB.validateQuery(events);
        return events;
    }

    private List<Action__c> getActions(ETLC_ApexBridge_Request request) {
        String eventId = String.valueOf(request.getInputValue('eventId'));
        List<Action__c> actions = [
            SELECT ID, Name, AppName__c, Command__c, Enabled__c, ErrorMessage__c, Fix__c, Expected__c, 
            Message__c, Operation__c, Order__c, ExtId__c, 
            (SELECT Id, Name, Event__c, Event__r.Name FROM Actions_X_Events__r),
            (SELECT Id, Name, Action__c, Key__c, Path__c, Value__c FROM JSON_Actions__r)
            FROM Action__c 
            WHERE ID IN (SELECT Action__c FROM Event_X_Action__c WHERE Event__c = :eventId)
            ORDER BY Order__c ASC
        ];
        ETLC_SecuredDB.validateQuery(actions);
        return actions;
    }

    private void updateAction(ETLC_ApexBridge_Request request) {
        List<Action__c> actions = request.records;
        ETLC_SecuredDB.performDML(ETLC_SecuredDB.Operation.Updating, actions); 
    }
}