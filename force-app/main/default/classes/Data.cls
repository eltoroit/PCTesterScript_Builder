public with sharing class Data extends ETLC_ApexBridge_Abstract {
    public override void process(ETLC_ApexBridge_Request request, ETLC_ApexBridge_Response response) {
        if (request.method == 'getAllEvents') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getAllEvents(request));
        } else if (request.method == 'getSelectedEvents') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getSelectedEvents(request));
        } else if (request.method == 'getActionsByEvent') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getActionsByEvent(request));
        } else if (request.method == 'getEventsByAction') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getEventsByAction(request));
        } else if (request.method == 'getEventsByAllActions') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(getEventsByAllActions(request));
        } else if (request.method == 'updateActions') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(updateActions(request));
        } else if (request.method == 'updateEventsByAction') {
            response.output = ETLC_ApexBridge_Abstract.encodeData(updateEventsByAction(request));
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
    private List<Action__c> getActionsByEvent(ETLC_ApexBridge_Request request) {
        String eventId = String.valueOf(request.getInputValue('eventId'));
        List<Action__c> actions = [SELECT ID, Order__c FROM Action__c
                                   WHERE ID IN (SELECT Action__c 
                                                FROM Event_X_Action__c
                                                WHERE Event__c = :eventId)
                                   ORDER BY Order__c ASC];
        ETLC_SecuredDB.validateQuery(actions);
        return actions;
    }
    private List<Event__c> getEventsByAction(ETLC_ApexBridge_Request request) {
        String actionId = String.valueOf(request.getInputValue('actionId'));
        List<Event__c> actions = [SELECT ID FROM Event__c
                                  WHERE ID IN (SELECT Event__c 
                                               FROM Event_X_Action__c
                                               WHERE Action__c = :actionId)
                                  ORDER BY Name ASC];
        ETLC_SecuredDB.validateQuery(actions);
        return actions;
    }
    private Map<Id, List<Id>> getEventsByAllActions(ETLC_ApexBridge_Request request) {
        Map<Id, List<Id>> output = new Map<Id, List<Id>>();
        List<Action__c> actions = [SELECT Id, (SELECT Event__c FROM Actions_X_Events__r) FROM Action__c];
        ETLC_SecuredDB.validateQuery(actions);
        for (Action__c action : actions) {
            List<Id> eventIds = new List<Id>();
            for (Event_X_Action__c eXa : action.Actions_X_Events__r) {
                eventIds.add(eXa.Event__c);
            }
            output.put(action.Id, eventIds);
        }
        return output;
    }
    private List<Event_X_Action__c> updateEventsByAction(ETLC_ApexBridge_Request request) {
        List<Event_X_Action__c> eXas;
        String actionId = String.valueOf(request.getInputValue('actionId'));
        List<Object> eventIds = (List<Object>) request.getInputValue('eventIds');
        
        // Delete the old records
        eXas = [SELECT ID FROM Event_X_Action__c WHERE Action__c = :actionId];
        ETLC_SecuredDB.performDML(ETLC_SecuredDB.Operation.Deleting, eXas);
        
        // Create the new records
        eXas = new List<Event_X_Action__c>();
        for (Object objEventId : eventIds) {
            String strEventId = String.valueOf(objEventId);
            eXas.add(new Event_X_Action__c(
                Action__c = actionId,
                Event__c = strEventId,
                UniqueKey__c = actionId + '-' + strEventId
            ));
        }
        ETLC_SecuredDB.performDML(ETLC_SecuredDB.Operation.Inserting, eXas);
        return eXas;
    }
    private List<Action__c> updateActions(ETLC_ApexBridge_Request request) {
        List<Action__c> actions = request.records;
        // ETLC_SecuredDB.performDML(ETLC_SecuredDB.Operation.Updating, actions);
        update actions;
        return getActionsByEvent(request);
    }
}