public class Util {
	public static void updateRecords() {
		update [SELECT ID FROM Action__c];
	}
	public static void renumber() {
		Integer order = 1;
		List<Action__c> actions = [SELECT Id, order__c FROM Action__c ORDER BY Order__c ASC, CreatedDate ASC];
		for (Action__c action : actions) {
			action.order__c = order++;
		}
		update actions;
	}

	public static String getFieldsCustom(String sobjName) {
		return getFields(sobjName, true);
	}

	public static String getFieldsAll(String sobjName) {
		return getFields(sobjName, false);
	}

	public static String getFields(String sobjName, Boolean isCustom) {
		Integer fieldCount = 0;
		String fieldNames = '';

		for (String fieldName : getFieldNames(sobjName)) {
			if ((!isCustom) || (fieldName.contains('__c'))) {
				fieldCount++;
				if (fieldCount > 1)
					fieldNames += ', ';
				fieldNames += fieldName;
			}
		}
		return fieldNames;
	}

	public static Set<String> getFieldNames(String sobjName) {
		Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe()
			.get(sobjName)
			.getDescribe()
			.fields.getMap();
		return fields.keyset();
	}
}

/*
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
*/

