
import { presets } from './json.js';


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function open_new_site() {
	chrome.storage.local.get({
		sites: []
	}, function(result) {
        if (result) {
			var sites = result.sites;
			var num = getRandomIntInclusive(0, sites.length - 1);
			var new_url = "http://" + sites[num];
			console.log(new_url);
			chrome.storage.local.get('tabId', function(resultTabId) {
				chrome.tabs.update(resultTabId.tabId, {
					url: new_url
				}, function() {
					// in case we want to put anything here...
				});
				chrome.storage.local.set({
					activeSite: new_url
				}, function() {
					// in case we want to put anything here...
				});
			});
		}
    });
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    chrome.storage.local.get('enabled', function(result) {
        var enabled = result.enabled;
        if (enabled == "Enabled" || enabled == "Running") {
            chrome.storage.local.get({
                'tabId': [],
            }, function(result) {
                //get the tab, to be sure it exists
                chrome.tabs.get(result.tabId, function(tab) {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError.message);
						start();
                    } else {
                        if (alarm.name == "newSite") {
                            open_new_site();
                        } else if (alarm.name == "linkClick") {
                            chrome.tabs.sendMessage(result.tabId, {
                                text: 'click link'
                            }, function(response) {
                                if (response == "linkclick failed") {
                                    open_new_site();
                                }
                            });
                        }
						var interval = getRandomIntInclusive(5, 45) * 1000;
						var rand = getRandomIntInclusive(0, 4);
						console.log('Sleeping for:', interval);
						if (rand == 0) { // 1/4 of the time
							chrome.alarms.create("newSite", {
								when: Date.now() + interval
							});
						} else {
							chrome.alarms.create("linkClick", {
								when: Date.now() + interval
							});
						}
                    }
                });
            });
        }
    });
});

function start() {
	console.log('Starting...');
	chrome.tabs.create({'url': chrome.runtime.getURL('about:blank')}, function(tab) {
	});
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(arrayOfTabs) {
		chrome.storage.local.set({
			tabId: arrayOfTabs[0].id
		}, function() {});
		open_new_site();
	});
	var interval = getRandomIntInclusive(5, 45) * 1000;
	console.log('Sleeping for:', interval);
	chrome.alarms.create("linkClick", {
		when: Date.now() + interval
	});	
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.msg == "start") {
		start();
		sendResponse({
			farewell: "open_new_site called"
		});
    } else if (request.msg == "reset") {
        initialize(function(results) {
            sendResponse(results);
        });
    }
    return true;
});

function initialize(callbackFunction) {
    var user_site_preset = presets.userSitePreset;
    chrome.storage.local.get({
        sites: 'stored_sites',
        userSitePreset: []
    }, function(result) {
        var sites = JSON.parse(JSON.stringify(presets.sites));
        chrome.storage.local.set({
            enabled: "Waiting",
            sites: sites
        }, function(result) {
            chrome.storage.local.get({
                'sites': [],
                'enabled': [],
                'userSitePreset': []
            }, function(result) {
                callbackFunction(result);
            });
        });
    });
}

initialize(function() {});
