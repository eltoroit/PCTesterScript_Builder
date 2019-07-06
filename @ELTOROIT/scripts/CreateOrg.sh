# Execute in Mac using: ./EXFiles/scripts/CreateOrg.sh
echo "*** Creating scratch Org..."
sfdx force:org:create -f config/project-scratch-def.json --setdefaultusername --setalias soVMCheck02
echo "*** Opening scratch Org..."
sfdx force:org:open
echo "*** Installing ApexBridge..."
sfdx force:package:install --package 04t6A000002D2ElQAK -w 10
echo "*** Pushing metadata to scratch Org..."
sfdx force:source:push
echo "*** Assigning permission set to your user..."
sfdx force:user:permset:assign -n Script_Maker
# echo "*** Generating password for Scratch Org..."
# sfdx force:user:password:generate
# echo "*** Displaying Scratch Org User..."
# sfdx force:org:display
# echo "*** Creating required users..."
# sfdx force:apex:execute -f EXFiles/data/CreateUsers.txt
echo "*** Creating data using ETCopyData plugin"
# sfdx ETCopyData:export -c './@ELTOROIT/scripts/data'
sfdx ETCopyData:import -c './@ELTOROIT/scripts/data' --loglevel warn
