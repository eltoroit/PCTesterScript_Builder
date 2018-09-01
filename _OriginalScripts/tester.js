#! /usr/bin/env node
"use strict";

// This script was created by Andres Perez to test the image machines.

// Requires
const fs = require('fs');
const readline = require('readline');
const { exec, execSync, spawn, spawnSync } = require('child_process');
const url = require('url');
const http = require('http');
const https = require('https');
const log = require('./colorLogs.js');

// Configure execution...
var debug = false;
var verbose = false;
var timerDelay = 250;
var executeManualChecks = false;
var testType  = "TEST";
if (testType=="PROD") {
	var debug = false;
	var verbose = false;
	var executeManualChecks = true;
} else if (testType=="TEST") {
	var debug = true;
	var verbose = true;
	var executeManualChecks = false;
}

// Data structure
var errors = [];
var errorCodes = {};
var idxInstructions;
var instructions = [];

// Bookmarks
var bm = {};
var bmPretendPath = "./bmPretend.txt";
const bmChromePath = "C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Bookmarks";
const bmFirefoxPath = ["C:\\Users\\Admin\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\","*.default","places.sqlite"];

function reportError(instruction) {
	if (debug) log.debug('ERROR FOR: ' + log.getPrettyJson(instruction));
	errors.push(instruction);
	log.error("*** *** ERROR", 1);
	log.error(log.getPrettyJson(instruction), 1);
}
function promptYesNo(instruction) {
	log.promptMsg(instruction.Message__c);

	var sendKeysCmd = "call sendkeys.bat \"C:\\Windows\\System32\\cmd.exe\" \"\"";
	// log.debug("Sending keys: " + sendKeysCmd);
	exec(sendKeysCmd);
	const inputReadLine1 = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	if (executeManualChecks) {
		var untilCorrectResponse = function () {
			inputReadLine1.question(log.getPromptMsg("[Y/N] > "), function (answer) {
				if (answer[0].toUpperCase() === 'Y') {
					inputReadLine1.close();
					nextInstruction();
				} else if (answer[0].toUpperCase() === 'N') {
					inputReadLine1.close();
					instruction.returned = "User responsed 'N'";
					reportError(instruction, true);
					nextInstruction();
				} else {
					untilCorrectResponse();
				}
			});
		}

		untilCorrectResponse();
	} else {
		log.error("Manual checks are being skipped for testing! (No prompt)");
		nextInstruction();
	}
}
function spawnCommand(instruction) {
	if (debug) log.debug("SPAWNING: " + log.getPrettyJson(instruction.Command__c));

	var process;
	try {
		if (instruction.Command__c.params) {
			process = spawn(instruction.Command__c.cmd, instruction.Command__c.params);
		} else {
			process = spawn(instruction.Command__c.cmd);
		}
	} catch (ex) {
		log.debug(ex);
		throw ex;
	}
	process.on('error', function (err) {
		console.log('child process exited with an error: ' + err);
	});
	setTimeout(function () {
		promptYesNo(instruction);
	}, timerDelay * 10);
}
function executeCommand(instruction) {
	if (debug) log.debug("EXECUTING: " + instruction.Command__c);
	var process = exec(instruction.Command__c, function (error, stdout, stderr) {
		var output = {
			cmd: instruction.Command__c,
			error: error
		};
		output.stdout = stdout ? stdout.trim() : "";
		output.stderr = stderr ? stderr.trim() : "";
		if (debug) log.debug("OUTPUT: " + log.getPrettyJson(output));
		instruction.callback(output);
	});
}
function checkExact(instruction) {
	if (verbose) log.info("CHECKING: [" + instruction.Command__c + "]");
	instruction.callback = function (output) {
		if (output.stdout === instruction.Expected__c) {
			if (verbose) log.success("VALID: [" + output.stdout + "]");
			nextInstruction();
		} else {
			instruction.returned = output;
			reportError(instruction);
			nextInstruction();
		}
	};
	executeCommand(instruction);
}
function checkContains(instruction) {
	if (verbose) log.info("CHECKING: [" + instruction.Command__c + "]");
	instruction.callback = function (output) {
		var valid = false;

		if (!instruction.Expected__c) valid = true;
		if ((output.stdout != "") && (output.stdout.indexOf(instruction.Expected__c) >= 0)) valid = true;
		if ((output.stderr != "") && (output.stderr.indexOf(instruction.Expected__c) >= 0)) valid = true;

		if (valid) {
			if (verbose) log.success("VALID: [" + instruction.Expected__c + "]");
		} else {
			instruction.returned = output;
			reportError(instruction);
		}
		nextInstruction();
	}
	executeCommand(instruction);
}
function checkPath(instruction) {
	if (verbose) log.info("CHECK PATH: [" + instruction.Command__c + "]");
	instruction.Command__c = "DIR \"" + instruction.Command__c + "\" /B";
	if (!instruction.callback) {
		instruction.callback = function (output) {
			if (output.stdout.toLowerCase().indexOf(instruction.Expected__c.toLowerCase()) >= 0) {
				if (verbose) log.success("VALID: [Found: '" + instruction.Expected__c + "']");
				nextInstruction();
			} else {
				instruction.returned = output;
				reportError(instruction);
				nextInstruction();
			}
		}
	}
	executeCommand(instruction);
}
function openUrl(urlToCheck, callback) {
	var outputData = "";
	var options = url.parse(urlToCheck);
	options.method = 'GET';

	var reqClient;
	if (options.protocol.toUpperCase() === "HTTPS:") {
		reqClient = https;
	} else {
		reqClient = http;
	}

	var reqWS = reqClient.request(options, function (resWS) {
		resWS.setEncoding('utf8');
		resWS.on('data', function (chunk) { outputData += chunk; });
		resWS.on('end', function () {
			var output = { body: outputData, statusCode: resWS.statusCode }
			if (debug) log.debug(output.body.substring(0, 250));
			callback(true);
		})
	});

	reqWS.on('error', function (e) {
		if (debug) log.debug(('problem with request: ', e));
		callback(false, e);
	});
	reqWS.end();
}


function findBookmarks_Chrome_Children(node, path) {
	var thisPath;
	
	if (node.name == "Bookmarks bar") {
		thisPath = "[BAR]";
	} else {
		thisPath = path + "[" + node.name + "]";
	}
	if (node.url) {
		var barNode = bm.Bar[thisPath];
		if (!barNode) barNode = {};
		barNode.Chrome = node.url;
		bm.Bar[thisPath] = barNode;

		bm.Chrome[thisPath] = node.url;
	}
	if (node.children) {
		for (var i = 0; i < node.children.length; i++) {
			findBookmarks_Chrome_Children(
				node.children[i], thisPath);
		}
	}	
}
function findBookmarks_Chrome() {
	bm.FF = {};
	bm.Bar = {};
	bm.Chrome = {};
	
	var data = loadFileJson(bmChromePath);
	findBookmarks_Chrome_Children(
		data["roots"]["bookmark_bar"], "");
}
function findBookmarks_Firefox() {
	var tmp = {};
	var record = {};
	var sqlitepath = "";

	tmp.TitlesByRow = {};
	tmp.TitlesByName = {};
	tmp.URLs = {};
	
	// Find sqlite path
	sqlitepath = bmFirefoxPath[0];
	var files = fs.readdirSync(sqlitepath);
	if (files.length == 1) {
		sqlitepath += "\\" + files[0] + "\\" + bmFirefoxPath[2];
		console.log("Path: " + sqlitepath);
	} else {
		throw new Error("Multiple profiles for Firefox found");
	}
	
	// Execute sqlite3 to get data
	var cmd = "";
	cmd += 'sqlite3 -header -line ';
	cmd += '"' + sqlitepath + '" ';
	cmd += '"SELECT b.id, b.parent, b.title as bTitle, p.title as pTitle, p.url FROM moz_bookmarks AS b LEFT JOIN moz_places AS p ON b.fk = p.id"';
	cmd += '> ./bmFF_LINE.txt';
	
	var process = exec(cmd, function (error, stdout, stderr) {
		if (error) throw new Error(error);
	
		// Process results
		var lineReader = require('readline').createInterface({
		  input: require('fs').createReadStream('./bmFF_LINE.txt')
		});

		lineReader.on('line', function (line) {
			if (line == "") {
				if (record.bTitle == "Bookmarks Toolbar") {
					record.bTitle = "BAR";
				}
				if (tmp.TitlesByRow[record.id]) {
					throw new Error("Record already defined");
				} else {
					tmp.TitlesByRow[record.id] = "";
				}
				if (record.url) tmp.URLs[record.id] = record.url;
				if (record.bTitle) {
					var title = "";
					if (record.parent) {
						title = tmp.TitlesByRow[record.parent];
					}
					title += "[" + record.bTitle + "]";
					if (tmp.TitlesByName[title]) {
						throw new Error("Duplicate record: [" + record.bTitle + "]");
					}
					tmp.TitlesByRow[record.id] = title;
					tmp.TitlesByName[title] = record.id;
				}
			
				record = {};
			} else {
				var parts = line.split('=');
				record[parts[0].trim()] = parts[1].trim();
			}
		});
	
		lineReader.on('close', function () {
			// Merge the data
			for (var path in tmp.TitlesByName) {
				if (path.startsWith("[BAR]")) {
					if (tmp.TitlesByName.hasOwnProperty(path)) {
						var rowId = tmp.TitlesByName[path];
						var url = tmp.URLs[rowId];
						if (url) {
							var barNode = bm.Bar[path];
							if (!barNode) barNode = {};
							barNode.FF = url;
							bm.Bar[path] = barNode;
							
							bm.FF[path] = url;
						}
					}
				}
			}
			
			// Check bm.Bar
			var bmBarNew = [];
			var bmBarTemp = bm.Bar;
			
			for (var path in bmBarTemp) {
				if (bmBarTemp.hasOwnProperty(path)) {
					var nodeNew = {};
					var nodeTemp = bmBarTemp[path];
					
					nodeNew.Title = path;
					nodeNew.hasFF = false;
					nodeNew.hasChrome = false;
					
					if (nodeTemp.FF && nodeTemp.Chrome && (nodeTemp.FF != nodeTemp.Chrome)) {
						throw new Error("FF and Chrome urls are different");
					}
					if (nodeTemp.FF) {
						nodeNew.Url = nodeTemp.FF;
						nodeNew.hasFF = true;
					}
					if (nodeTemp.Chrome) {
						nodeNew.Url = nodeTemp.Chrome;
						nodeNew.hasChrome = true;
					}
					
					// Assume we are going to be checking both URLs
					nodeNew.checkFF = true;
					nodeNew.checkChrome = true;
					
					bmBarNew.push(nodeNew);
				}
			}
			bm.Bar = bmBarNew;
			
			// Write to files
			fs.writeFile("./bmDump.txt", JSON.stringify(bm.Bar, null, 4), function(err) {
				if(err) throw new Error(err);
				console.log("The file [" + "./bmDump.txt" + "] was saved!");
			}); 

			fs.writeFile("./bm.txt", JSON.stringify(bm, null, 4), function(err) {
				if(err) throw new Error(err);
				console.log("The file [" + "./bm.txt" + "] was saved!");
			});
			
			// Validate them
			validateBookmarks_Process();
		});
	});
}
function validateBookmarks_Process() {
	var bmChecks = loadFileJson("./bmCheck.txt");
	
	bmChecks.forEach(function(bmCheck) {
		var foundUrl;
		var expectedUrl = bmCheck.Url;
		
		if (bmCheck.checkFF) {
			foundUrl = bm.FF[bmCheck.Title];
			if (expectedUrl !== foundUrl) {
				console.log("BAD: Bookmark does not match. Title *[FF]" + bmCheck.Title + "*,  Expected [" + expectedUrl + "], found [" + foundUrl + "]");
			}
		}
		
		if (bmCheck.checkChrome) {
			foundUrl = bm.Chrome[bmCheck.Title];
			if (expectedUrl !== foundUrl) {
				console.log("BAD: Bookmark does not match. Title *[Chrome]" + bmCheck.Title + "*,  Expected [" + expectedUrl + "], found [" + foundUrl + "]");
			}
		}
	});
}
function validateBookmarks(instruction) {
	if (verbose) log.info("Verifying Bookmarks");

	
	if (doesFileExist(bmPretendPath)) {
		log.info("Bookmarks information read from file [" + bmPretendPath + "]");
		bm = loadFileJson(bmPretendPath);
		validateBookmarks_Process();	
	} else {
		// validateBookmarks_Process is not called from here directly because it is going to work asynchronously... invk=oked from findBookmarks_Firefox.
		// Do not reverse the order here. First Chrome, then Firefox.
		findBookmarks_Chrome();
		findBookmarks_Firefox();
	}
}



function jsonFile_Edit(instruction) {
	if (verbose) log.info("Editing JSON File: " + instruction.AppName__c);

	if (debug) log.debug("Reading JSON_Action__c");
	var JSON_Action;
	JSON_Action = instruction.JSON_Actions__r;
	if (JSON_Action.totalSize != 1) throw new Error("Multiple JSON Actions are not allowed!");
	JSON_Action = JSON_Action.records[0];

	if (debug) log.debug("Reading JSON file");
	var fileContents = loadFileJson(instruction.Command__c);
	var data = fileContents;
	var paths = JSON_Action.Path__c.split(":");

	if (debug) log.debug("Processing JSON path: " + JSON_Action.Path__c);
	for (var i = 0; i < paths.length; i++) {
		var path = paths[i];
		if (path != "") {
			if (path[0] == "[") {
				// Remove [ and ]
				path = path.substring(1, path.length - 1);
				// Split it
				path = path.split("=");
				var key = path[0];
				var value = path[1];
				if (data && data.length > 0) {
					for (var j = 0; j < data.length; j++) {
						var d = data[j];
						if (d[key] == value) {
							data = d;
						}
					}
				} else {
					log.error("DATA IS NOT CORRECT (3)");
					reportError(instruction);
				}
			} else {
				var s1 = JSON.stringify(data).length;
				data = data[path];
				var s2 = JSON.stringify(data).length;
				if (s1 <= s2) {
					log.error("DATA IS NOT CORRECT(4)");
					reportError(instruction);
				}
			}
		}
	}

	if (debug) log.debug("Writing data: " + log.getPrettyJson(data));
	data[JSON_Action.Key__c] = JSON_Action.Value__c;
	fs.writeFile(instruction.Command__c, log.getPrettyJson(fileContents), function (err) {
		instruction.returned = err;
		instruction.Expected__c = "File is saved with new information";
		if (err) {
			reportError(instruction);
			nextInstruction();
		} else {
			if (verbose) log.success("VALID: file has been updated: " + instruction.Command__c);
			nextInstruction();
		}
	});
}
function loadFileJson(path) {
	return JSON.parse(loadFile(path));
}
function doesFileExist(path) {
	var exists = false;
	try { exists = (fs.statSync(path).size > 0) } catch (ex) {}

	return exists;
}
function loadFile(path) {
	if (verbose) log.debug("Reading file: " + path);

	if (!doesFileExist(path)) {
		log.error("Files does not exist: " + path);
		try {
			fs.writeFileSync(path, '{}');
		} catch (ex) {
			log.error("Error creating file: " + path);
		}
	}

	return fs.readFileSync(path, 'utf8');
}
function nextInstruction() {
	setTimeout(executeInstruction, timerDelay);
}
function executeInstruction() {
	if (idxInstructions >= instructions.length) return;
	var instruction = instructions[idxInstructions++];

	// Check AppName__c
	switch (instruction.Operation__c) {
		case "Clear":
		case "Write":
			break;
		default:
			log.info(">>> Instruction #" + idxInstructions + ": " + instruction.Name + " | " + instruction.AppName__c + " | " + instruction.Operation__c);
			if (debug) log.debug(log.getPrettyJson(instruction));

			// Check every record has an AppName__c
			if (!instruction.AppName__c) {
				var msg = "Instruction #" + idxInstructions + ". Does not have a valid AppName__c. " + log.getPrettyJson(instruction);
				log.error(msg);
				throw msg;
			}

			// Check unique record AppName__c
			instruction.AppName__c = instruction.AppName__c.toUpperCase();
			if (errorCodes[instruction.AppName__c]) {
				var msg = "Instruction #" + idxInstructions + ". You can not reuse AppName__c. " + log.getPrettyJson(instruction);
				log.error(msg);
				throw msg;
			}
			errorCodes[instruction.AppName__c] = instruction;
	}

	switch (instruction.Operation__c) {
		case "Check Contains":
			checkContains(instruction);
			break;
		case "Check Exact":
			checkExact(instruction);
			break;
		case "Check Path":
		    checkPath(instruction);
			break;
		case "Bookmark":
		    validateBookmarks(instruction);
			break;
		case "Clear":
			// Clear screen
			log.clearScreen();
			nextInstruction();
			break;
		case "JSON File - Check":
			stopAndFix = true;
			break;
		case "JSON File - Edit":
			jsonFile_Edit(instruction);
			break;
		case "Manual":
			promptYesNo(instruction);
			break;
		case "Open Application":
			if (executeManualChecks) {
				instruction.callback = function (output) {
					if (output.stderr) {
						instruction.hasErrors = true;
						instruction.returned = output;
						reportError(instruction);
						nextInstruction();
					}
				};
				executeCommand(instruction);
				setTimeout(function () {
					if (!instruction.hasErrors) {
						promptYesNo(instruction);
					}
				}, timerDelay * 10);
			} else {
				log.error("Manual checks are being skipped for testing! (Open application skipped)");
				nextInstruction();
			}
			break;
		case "Write":
			if (instruction.Command__c == "=== === === AUTOMATED CHECKS === === ===") {
				if (executeManualChecks) {
					log.error("Switching debug mode ON");
					debug = true;
					verbose = true;	
				}
			}
			log.info(instruction.Command__c);
			nextInstruction();
			break;
		case "Done":
			var filePath = "Errors-" + (new Date().getTime()) + ".json";
			try {
				fs.unlinkSync(filePath);
			} catch (ex) {
				if (debug) log.debug("Could not delete file " + filePath + ": " + log.getPrettyJson(ex));
			}
			if (errors.length > 0) {
				log.error("Number Of Errors Found: " + errors.length);
				fs.appendFileSync(filePath, log.getPrettyJson(errors));
				log.error("Errors written to: ./" + filePath);
				log.error("Please put a sticker on this computer");
			} else {
				log.clearScreen();
				log.success("Test complete and no errors found. Thanks for your help ;-)");
				log.success("Please close this and all other windows that were opened during the test");
			}
			process.exit(0);
			break;
		default:
			log.error("Invalid operation: " + log.getPrettyJson(instruction));
			stopAndFix = true;
	}
}
function menuChooseEvent(data) {
	var events = data.events;

	log.info("Application Tester built by Andres Perez (ELTORO.IT) to help validate the computer's setup");
	log.info("");
	log.info("Please select the test you want to run");
	for (var i = 1; i <= events.length; i++) {
		log.info(i + ". " + events[i - 1].Name);
	}
	log.info(0 + ". Exit without testing");

	const inputReadLine2 = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	var forEver = function () {
		inputReadLine2.question(log.getPromptMsg("Please select a number [0 - " + events.length + "] > "), function (answer) {
			if (answer == 0) {
				process.exit(0);
			} else if ((answer >= 1) && (answer <= events.length)) {
				inputReadLine2.close();
				var event = events[answer - 1];
				instructions = data.actionsByEvent[event.Id];
				instructions.push({
					AppName__c: "Done",
					Operation__c: "Done",
					Name: "Done"
				});
				idxInstructions = 0;
				executeInstruction();
			} else {
				forEver();
			}
		});
	}

	forEver();
}


log.clearScreen();
log.promptMsg('Version: 2018-09-01 @ 11:29:00 AM EST');
if (doesFileExist(bmPretendPath)) {
	log.error("BOOKMARKS ARE NOT PROCESSED FROM THE BROWSERS!!! Bookmarks are procesed from file [" + bmPretendPath + "]. Delete the file is this is a real test");
}
menuChooseEvent(loadFileJson('./data.json'));





/*




function ChromeBookmark(instruction) {
	if (verbose) log.info("Verifying Bookmark in Chrome: " + instruction.AppName__c);

	// if (debug) log.debug("Reading JSON_Action__c");
	var JSON_Action;
	JSON_Action = instruction.JSON_Actions__r;
	if (JSON_Action.totalSize != 1) throw new Error("Multiple JSON Actions are not allowed!");
	JSON_Action = JSON_Action.records[0];

	// if (debug) log.debug("Reading bookmarks file");
	var fileContents = loadJsonFile(instruction.Command__c);
	var data = fileContents;
	var paths = JSON_Action.Path__c.split(":");

	if (debug) log.debug("Processing bookmarks file: " + JSON_Action.Path__c);
	for (var i = 0; i < paths.length; i++) {
		var path = paths[i];
		if (path != "") {
			if (path[0] == "[") {
				// Remove [ and ]
				path = path.substring(1, path.length - 1);
				// Split it
				path = path.split("=");
				var key = path[0];
				var value = path[1];
				if (data && data.length > 0) {
					for (var j = 0; j < data.length; j++) {
						var d = data[j];
						if (d[key].trim().toUpperCase() == value.trim().toUpperCase()) {
							data = d;
						}
					}
				} else {
					log.error("DATA IS NOT CORRECT (1)");
					reportError(instruction);
				}
			} else {
				var s1 = JSON.stringify(data).length;
				data = data[path];
				var s2 = JSON.stringify(data).length;
				if (s1 <= s2) {
					log.error("DATA IS NOT CORRECT(2)");
					reportError(instruction);
				}
			}
		}
	}
	if (debug) log.debug("Found bookmark: " + log.getPrettyJson(data));

	if (debug) log.debug("Opening bookmark");
	var url = data[JSON_Action.Key__c];
	if (url === JSON_Action.Value__c) {
		openUrl(url, function (isSuccess, error) {
			if (!isSuccess) {
				instruction.hasErrors = true;
				instruction.returned = error;
				reportError(instruction);
				nextInstruction();
			} else {
				log.success("VALID: Bookmark in Chrome: " + instruction.AppName__c);
				nextInstruction();
			}
		});
	} else {
		instruction.returned = url;
		reportError(instruction);
		nextInstruction();
	}
}

*/