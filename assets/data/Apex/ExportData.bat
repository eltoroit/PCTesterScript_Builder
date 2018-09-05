# EXECUTE IT:
# CD >> ./Build
# FROM Build assets/data/Apex/ExportData.bat

# Prepare data
echo "Please wait (1/4)..."
sfdx force:apex:execute -f assets/data/Apex/ExportData.txt > /dev/null

# Export for scripts
echo "Please wait (2/4)..."
sfdx force:user:display --json | jq -r '.result | .instanceUrl, .accessToken' | {
    jsonFile="_OriginalScripts/data.json"
    # echo "Writing to: $jsonFile"
    read -r instanceUrl
    # echo "Sever: $instanceUrl"
    read -r accessToken
    # echo "Session: $accessToken"
    # NO NEED TO REPLACE THIS >>> echo $accessToken | sed 's/!/\\!/g' | read -r session
    cmdExport="$(echo curl $instanceUrl/services/apexrest/WS_ExportData -H \"Authorization: OAuth $accessToken\")"
    # echo "Execute: $cmdExport"
    eval $cmdExport | jq '.' > $jsonFile
    # cat $jsonFile 
}

# Copy files to updte repository
echo "Please wait (3/4)..."
rm _OriginalScripts/Errors-*.json
cp _OriginalScripts/* ../Run
rm ../Run/bmPretend.txt
echo "*** Scripts generated..."

# Export for Backup
echo "Please wait (4/4)..."
sfdx force:data:soql:query -r csv -q "SELECT id, ownerid, isdeleted, name, createddate, createdbyid, lastmodifieddate, lastmodifiedbyid, systemmodstamp, lastvieweddate, lastreferenceddate, appname__c, command__c, enabled__c, errormessage__c, expected__c, extid__c, fix__c, message__c, operation__c, order__c FROM Action__c" > assets/data/Action__c.csv
sfdx force:data:soql:query -r csv -q "SELECT id, ownerid, isdeleted, name, createddate, createdbyid, lastmodifieddate, lastmodifiedbyid, systemmodstamp, lastvieweddate, lastreferenceddate, active__c, extid__c FROM Event__c" > assets/data/Event__c.csv
sfdx force:data:soql:query -r csv -q "SELECT id, isdeleted, name, createddate, createdbyid, lastmodifieddate, lastmodifiedbyid, systemmodstamp, event__c, action__c, uniquekey__c FROM Event_X_Action__c" > assets/data/Event_X_Action__c.csv
sfdx force:data:soql:query -r csv -q "SELECT id, isdeleted, name, createddate, createdbyid, lastmodifieddate, lastmodifiedbyid, systemmodstamp, lastvieweddate, lastreferenceddate, action__c, key__c, value__c, path__c FROM JSON_Action__c" > assets/data/JSON_Action__c.csv

# Game Over!
echo "DONE"
