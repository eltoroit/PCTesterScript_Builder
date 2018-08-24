trigger tAction on Action__c (before insert, after insert, before update, after update) {
    if (trigger.isBefore) {
        Decimal maxOrder;
        try {
            maxOrder = ([SELECT Order__c FROM Action__c ORDER BY Order__C DESC LIMIT 1].Order__c)*2;
        } catch (Exception ex) {
            maxOrder = 10;
        }
        for (Action__c action : trigger.new) {
            if (trigger.isInsert) {
                if (action.ExtId__c == null) action.ExtId__c = 'TEMP Id: ' + maxOrder;
                if (action.Order__c == null) action.Order__c = maxOrder++;
            }
            if (action.Operation__c == 'Open Application') {
                if (action.Expected__c == null) action.Expected__c = 'Application runs with no errors';
                action.Message__c = 'Opening Application: "' + action.AppName__c + '". Was this succesful?';
                action.ErrorMessage__c = 'Unable to open application: "' + action.AppName__c + '"';
            } else if (action.Operation__c == 'Clear') {
                if (action.AppName__c == null) action.AppName__c = action.Name;
            } else if (action.Operation__c == 'Manual') {
                action.Expected__c = 'User validated: ' + action.Command__c;
                action.Message__c = action.Expected__c;
                action.ErrorMessage__c = 'User could not validate: ' + action.Command__c;
            } else if (action.Operation__c == 'Check Exact') {
                action.Message__c = 'Checking exact: ' + action.Command__c;
                action.ErrorMessage__c = 'Invalid response received';
            } else if (action.Operation__c == 'Check Path') {
                action.Message__c = 'Checking path: ' + action.Command__c;
                action.ErrorMessage__c = 'Invalid response received';
            } else if (action.Operation__c == 'Check Contains') {
                action.Message__c = 'Validating: ' + action.AppName__c + ' (' + action.Command__c  + ')';
                action.ErrorMessage__c = 'Could not validate: ' + action.AppName__c + ' (' + action.Command__c  + ')';
            } else if (action.Operation__c == 'Chrome Bookmark') {
                action.Message__c = 'Validating: ' + action.AppName__c;
                action.ErrorMessage__c = 'Could not validate: ' + action.AppName__c;
            } else if (action.Operation__c == 'Edit JSON File') {
                action.Message__c = 'Updating Json File: "' + action.AppName__c + '"';
                action.ErrorMessage__c = 'Could not update json file: "' + action.AppName__c + '"';
            }
        } 
    } else {
        Boolean doSort = trigger.isInsert;
        if (trigger.isUpdate) {
            for (Action__c action : trigger.new) {
                if (action.Order__c != trigger.oldMap.get(action.Id).Order__c) {
                    doSort = true;
                    break;
                }
            }
        }         
        if (doSort) {
            Util.renumber();
        }

        if (trigger.isInsert) {
            Integer uniqueKey = 1;
            Id defaultEventId = [SELECT ID FROM Event__c].Id;
            List<Event_X_Action__c> eXas = new List<Event_X_Action__c>();
            for (Action__c action : trigger.new) {
                eXas.add(new Event_X_Action__c(
                    Action__c = action.Id,
                    Event__c = defaultEventId,
                    UniqueKey__c = 'Key:' + uniqueKey++
                ));
            }
            insert eXas;
        }
    }
}