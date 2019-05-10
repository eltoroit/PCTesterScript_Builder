public class Util {
    public static void updateRecords() {
        UPDATE [SELECT ID FROM Action__c];
    }
    public static void renumber() {
        Integer order = 1;
        List<Action__c> actions = [SELECT Id, order__c FROM Action__c ORDER BY Order__c ASC, CreatedDate ASC];
        for (Action__c action : actions) {
            action.order__c = order++;
        }
        UPDATE actions;
    }
    public static List<Action__c> findActions(String criteriaSOQL, Event__c event) {
        String SOQL;
        String eventId = event.Id;

        SOQL = 'SELECT Id, Name, ';
        SOQL += getFieldsCustom('Action__c') + ', ';
        SOQL += '(SELECT ID, Name, ' + getFieldsCustom('JSON_Action__c') + ' FROM JSON_Actions__r) ';
        SOQL += 'FROM Action__c WHERE Enabled__c = true ';
        if (criteriaSOQL != null)  SOQL += 'AND (' + criteriaSOQL + ') ';
        SOQL += 'AND Id IN (SELECT Action__c FROM Event_X_Action__c WHERE Event__c = :eventId) ';
        SOQL += 'ORDER BY Order__c ASC ';
        System.debug(SOQL); 
        return  Database.query(SOQL);
    }

    // public static void SOQLsToBackup() {
    //     Map<String, String> SOQLs = new Map<String, String>();
    //     String SOQL;

    //     SOQL = 'SELECT ' + getFieldsAll('Action__c') + ' FROM Action__c';
    //     Database.query(SOQL);
    //     SOQLs.put('Action__c', SOQL);

    //     SOQL = 'SELECT ' + getFieldsAll('Event__c') + ' FROM Event__c';
    //     Database.query(SOQL);
    //     SOQLs.put('Event__c', SOQL);

    //     SOQL = 'SELECT ' + getFieldsAll('Event_X_Action__c') + ' FROM Event_X_Action__c';
    //     Database.query(SOQL);
    //     SOQLs.put('Event_X_Action__c', SOQL);
        
    //     SOQL = 'SELECT ' + getFieldsAll('JSON_Action__c') + ' FROM JSON_Action__c';
    //     Database.query(SOQL);
    //     SOQLs.put('JSON_Action__c', SOQL);
        
    //     // Create statements to execute
    //     String msg = '';
    //     msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n';
    //     msg += 'Now run these commnads from the terminal\r\n';
    //     for (String key : SOQLs.keySet()) {
    //         msg += 'sfdx force:data:soql:query -r csv -q "' + SOQLs.get(key) + '" > assets/data/' + key + '.csv' + '\r\n';
    //     } 
    //     msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n'; msg += '\r\n';
    //     System.debug(JSON.serializePretty(msg));
    // }

    private static String getFieldsCustom(String sobjName) {
        return getFields(sobjName, true);
    }
    private static String getFieldsAll(String sobjName) {
        return getFields(sobjName, false);
    }
    private static String getFields(String sobjName, Boolean isCustom) {
        Integer fieldCount = 0;
        String fieldNames = '';

        for (String fieldName : getFieldNames(sobjName)) {
            if ((!isCustom) || (fieldName.contains('__c'))) {
                fieldCount++;
                if (fieldCount > 1) fieldNames += ', ';
                fieldNames += fieldName;        
            }
        }
        return fieldNames;
    }

    private static Set<String> getFieldNames(String sobjName) {
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(sobjName).getDescribe().fields.getMap() ;
        return fields.keyset();
    }
}