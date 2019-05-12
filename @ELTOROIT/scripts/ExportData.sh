### EXECUTE IT:
### Export Data:
###    ./@ELTOROIT/scripts/ExportData.sh
### Push to gitHub
###    cd ../PCTesterScript
###    ./push.bat

# Prepare data
echo "--- --- --- Please wait (1/5): Renumbering"
sfdx force:apex:execute -f "./@ELTOROIT/scripts/Apex/ExportData.txt" > "./@ELTOROIT/scripts/Apex/ExportData.log"

# Export for scripts
echo "--- --- --- Please wait (2/5): Exporting data"
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
echo "--- --- --- Please wait (3/5): Copying files to runtime folder"
rm -f _OriginalScripts/Errors-*.json
cp _OriginalScripts/* ../PCTesterScript
rm ../PCTesterScript/bmPretend.txt
echo "--- Scripts generated..."

# Export for Backup
echo "--- --- --- Please wait (4/5): Export data"
sfdx ETCopyData:export -c './@ELTOROIT/scripts/data' --loglevel trace

# Push to GitHub
echo "--- --- --- Please wait (5/5): Push to GitHub"
cd ../PCTesterScript
./push.bat


# Game Over!
echo "--- --- --- DONE"
Date