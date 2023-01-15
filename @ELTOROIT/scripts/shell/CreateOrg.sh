# Execute in Mac using: ./EXFiles/scripts/CreateOrg.sh
echo "*** Creating scratch Org..."
sfdx force:org:create -f config/project-scratch-def.json --setdefaultusername --setalias soVMCheck02 --durationdays=30
echo "*** Opening scratch Org..."
sfdx force:org:open
echo "*** Installing ApexBridge..."
sfdx force:package:install --package 04t6A000002D2ElQAK -w 10
echo "*** Pushing metadata to scratch Org..."
sfdx force:source:push
echo "*** Assigning permission set to your user..."
sfdx force:user:permset:assign -n Script_Maker
echo "*** Creating data using ETCopyData plugin"
# sfdx ETCopyData:export -c './@ELTOROIT/data' --loglevel trace --json
sfdx ETCopyData:import -c './@ELTOROIT/data' --loglevel trace --json
echo "*** Displaying Scratch Org User..."
sfdx force:org:display --json