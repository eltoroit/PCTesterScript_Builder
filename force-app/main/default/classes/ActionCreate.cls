public with sharing class ActionCreate extends ETLC_ApexBridge_Abstract {
    public override void process(ETLC_ApexBridge_Request request, ETLC_ApexBridge_Response response) {
        if (request.method == 'getAllEvents') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getAllEvents(request));
        } else if (request.method == 'getSelectedEvents') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getSelectedEvents(request));
        } else {
            throw new ETLC_Exception('Unexpected "method" received');
        }
    }

    private List<Event__c> getAllEvents(ETLC_ApexBridge_Request request) {
        List<Event__c> events = [
            SELECT Id, Name, ActiveEvent__c 
            FROM Event__c 
            WHERE ActiveEvent__c = true 
            ORDER BY Name 
        ];
        ETLC_SecuredDB.validateQuery(events);
        return events;
    }

    private List<Id> getSelectedEvents(ETLC_ApexBridge_Request request) {
        String actionId = String.valueOf(request.getInputValue('actionId'));
        
        List<Id> output = new List<Id>();
        List<Event__c> events = [
            SELECT Id, Name, ActiveEvent__c 
            FROM Event__c
            WHERE Id IN (SELECT Event__c FROM Event_X_Action__c WHERE Action__c = :actionId)
        ];
        ETLC_SecuredDB.validateQuery(events);
        for (Event__c event : events) {
            output.add(event.Id);
        }
        return output;
    }

    private void updateEventActions(ETLC_ApexBridge_Request request) {
        String actionId = String.valueOf(request.getInputValue('actionId'));
        List<Id> events = (List<ID>) request.getInputValue('events');


    }
}