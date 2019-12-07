trigger tAction on Action__c(before insert, after insert, before update, after update) {
	if (Trigger.isBefore) {
		Decimal maxOrder;
		try {
			maxOrder = ([SELECT Order__c FROM Action__c ORDER BY Order__c DESC LIMIT 1].Order__c) * 2;
		} catch (Exception ex) {
			maxOrder = 10;
		}
		for (Action__c action : Trigger.new) {
			if (Trigger.isInsert) {
				if (action.Order__c == null)
					action.Order__c = maxOrder++;
			}
			switch on action.Operation__c {
				when 'Open Application' {
					if (action.Expected__c == null)
						action.Expected__c = 'Application runs with no errors';
					action.Message__c = 'Opening Application: "' + action.AppName__c + '". Was this succesful?';
					action.ErrorMessage__c = 'Unable to open application: "' + action.AppName__c + '"';
				}
				when 'Clear' {
					if (action.AppName__c == null)
						action.AppName__c = action.Name;
				}
				when 'Manual' {
					action.Expected__c = 'User validated: ' + action.Command__c;
					action.Message__c = action.Expected__c;
					action.ErrorMessage__c = 'User could not validate: ' + action.Command__c;
				}
				when 'Check Exact' {
					action.Message__c = 'Checking exact: ' + action.Command__c;
					action.ErrorMessage__c = 'Invalid response received';
				}
				when 'Check Path' {
					action.Message__c = 'Checking path: ' + action.Command__c;
					action.ErrorMessage__c = 'Invalid response received';
				}
				when 'Check Contains' {
					action.Message__c = 'Validating: ' + action.AppName__c + ' (' + action.Command__c + ')';
					action.ErrorMessage__c = 'Could not validate: ';
					action.ErrorMessage__c += action.AppName__c + ' (' + action.Command__c + ')';
				}
				when 'Bookmark' {
					action.Message__c = 'Validating: ' + action.AppName__c;
					action.ErrorMessage__c = 'Could not validate: ' + action.AppName__c;
				}
				when 'Edit JSON File' {
					action.Message__c = 'Updating Json File: "' + action.AppName__c + '"';
					action.ErrorMessage__c = 'Could not update json file: "' + action.AppName__c + '"';
				}
				when 'Include Event' {
					action.AppName__c = '### INCLUDE ' + action.Trailhead_Event_Name__c;
					action.Expected__c = action.AppName__c;
					action.Command__c = action.AppName__c;
					action.Fix__c = action.AppName__c;
					//
					action.Message__c = action.AppName__c;
					action.ErrorMessage__c = action.AppName__c;
				}
				when else {
				}
			}
		}
	} else {
		Boolean doSort = Trigger.isInsert;
		if (Trigger.isUpdate) {
			for (Action__c action : Trigger.new) {
				if (action.Order__c != Trigger.oldMap.get(action.Id).Order__c) {
					doSort = true;
					break;
				}
			}
		}
		if (doSort) {
			Util.renumber();
		}
	}
}
