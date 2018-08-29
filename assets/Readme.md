# Rebuild
## Register DevHub Org
```
https://developer.salesforce.com/promotions/orgs/dx-signup
sfdx force:auth:web:login -a dhScriptMaker -d
```
## Create new Scratch ORG
```
sfdx force:org:create -f config/project-scratch-def.json --setalias soMAC20 --setdefaultusername -w 10
sfdx force:package:install --package 04t6A000002D2ElQAK -w 10
sfdx force:package:install --package 04t6A000002D2EqQAK -w 10
sfdx force:source:push
sfdx force:user:permset:assign -n Script_Maker
sfdx force:org:open
sfdx force:user:password:generate
sfdx force:org:display
Workbench <Load Data>
    - Order:
        - Event__c
            - Do NOT map out the owner field
        - Action__c
            - Do NOT map out the owner field
            - Only works if ONE and only ONE event was loaded... Make sure the trigger is assigning to valid event.
        - Event_X_Action__c
            - No need to load this, since the trigger automatically creates the record.
        - JSON_Action__c
            - Do NOT map out the owner field
```
## Export Data
```
CHECK: Using Workbench, go to this URL
    /services/apexrest/WS_ExportData
EXPORT: Using the SFDX CLI, export the data
    Scripted
        sfdx force:user:display --json | \
        jq -r '.result | .instanceUrl, .accessToken' | \
        {
            jsonFile="assets/scripts/data.json"
            read -r instanceUrl
            read -r accessToken
            # NO NEED TO REPLACE THIS >>> echo $accessToken | sed 's/!/\\!/g' | read -r session
            echo curl $instanceUrl/services/apexrest/WS_ExportData -H \"Authorization: OAuth $accessToken\" | read -r cmdExport
            eval $cmdExport | jq '.' > $jsonFile
            cat $jsonFile 
        }
    Base Curl
        curl ***instance_name***/services/apexrest/WS_ExportData -H "Authorization: OAuth ***AccessToken***" > assets/scripts/data.json
    Find data name
        sfdx force:user:display
            Copy/paste: Access Token (replace ! with \!)
            Copy/paste: Instance Url
    Full Curl
        curl https://force-dream-9371-dev-ed.cs8.my.salesforce.com/services/apexrest/WS_ExportData -H "Authorization: OAuth 00DL00000061j0H\!ARkAQHFL_Df8LQI0sw0HqXTLEOGGDLIQoZYeJGWt1.5LxXOGetlLShTL.bJRVS5L42VybMQbTBZVVygvJ.R5xtv9Xt9gYOKY" > assets/scripts/data.json
```

# Virtual Machine
- Alpha is the one that is going to be replicated
- Validate the script on Bravo.
- 

# Bookmarks on Chrome
    - copy "C:\Users\Admin\AppData\Local\Google\Chrome\User Data\Default\Bookmarks" bmChrome.json
# Bookmarks on Firefox
- Needs SQLite, download here:
    - https://www.sqlite.org/download.html
    - https://www.sqlite.org/2018/sqlite-tools-win32-x86-3240000.zip
- Location
    - %APPDATA%\Mozilla\Firefox\Profiles\
    - C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles
    - C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\*.default\
    - C:\Users\<user>\AppData\Roaming\Mozilla\Firefox\Profiles\<profile folder>\places.sqlite
    -  C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite
- How
    SQLite
        - Database structure: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Database
        - sqlite3 -header -column "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "select * from moz_bookmarks"
        - sqlite3 -header "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "select id, type, fk, parent, title from moz_bookmarks"
        - sqlite3 -header "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "SELECT a.id AS ID, a.title AS Title, b.url AS URL FROM moz_bookmarks AS b JOIN moz_places AS b ON a.fk = b.id"
        - sqlite3 -header "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "SELECT b.id, b.type, b.fk, b.parent, b.title, p.title, p.url FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id"
        - sqlite3 -header -csv "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "SELECT b.id, b.parent, b.title, p.title, p.url FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id"
        - *** sqlite3 -header -csv "C:\Users\Admin\AppData\Roaming\Mozilla\Firefox\Profiles\ji3dkhsg.default\places.sqlite" "SELECT b.id, b.parent, b.title as bTitle, p.title as pTitle, p.url FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id" > bmFirefox.json
            - bTitle = Bookmark title
            - pTitle = <HTML><HEAD><Title>....</Title></HEAD></HTML> (Do not care about this).









# FINISH THIS PROJECT... !!!
I did not finish the data entry or data export tools in Lightning. I did not have time, so the only thing I was able to do was to enter the data manually. This needs to be fixed. When there is time! Maybe if this is a success, fix the data entry mode and re-use in future events.


# General knowledge
## How to push when saving?
```
https://ntotten.com/2018/01/17/using-nodemon-to-autopush-sfdx-project-changes/
$ npm init
$ npm install nodemon --save-dev
Edit package.json
    "nodemonConfig": {
        "watch": ["force-app"],
        "exec": "sfdx force:source:push",
        "ext": "cls,xml,json,js,trigger,cpm,css,design,svg",
        "delay": "2500"
    }
VS Code create a new shell
$ npx nodemon
```
## Execute anonymous
```
sfdx force:apex:execute
    System.debug('Hello');
    CTRL+D
sfdx force:apex:execute -f assets/Apex/ExportData.txt
```
## Re-use ORG in other Computer
```
1. Re-login to Scratch Org to refresh token
2. Get "Sfdx Auth Url"
sfdx force:org:display --verbose
3. Copy "Sfdx Auth Url" to file
4. Retrieve file from other computer
5. Register Org using that file
sfdx force:auth:sfdxurl:store -s -a soDOS -f assets/SOUrl.txt
```
## Some ideas for deep cloning....
```
Map<String, List<Action__c>> actionsByEvent = WS_ExportData.getJsonData().actionsByEvent;
Map<String, List<Action__c>> actionsByEvent2 = new Map<String, List<Action__c>>();
for (String key : actionsByEvent.keyset()) {
	List<Action__c> actions = actionsByEvent.get(key);
    actionsByEvent2.put(key, actions.deepClone());
}

for (String key : actionsByEvent2.keyset()) {
    System.debug('*** ' + key);
    List<Action__c> actions = actionsByEvent2.get(key);
    for (Action__c action : actions) {
	    System.debug(action.JSON_Actions__r);
    }
}
System.debug('DONE');
```
## Backup complex data
```
Create External Id fields (ExtId__c)
sfdx force:data:soql:query -r csv -q <QUERY>
Load it with Workbench...
```



