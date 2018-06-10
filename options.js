
function status_alert(divId, message, time) {
    var status = document.getElementById(divId);
    status.textContent = message;
    setTimeout(function() {
        status.textContent = '';
    }, time);
}

function disable_script() {
    chrome.storage.local.set({
        enabled: "Waiting"
    }, function() {
        chrome.alarms.clearAll();
        document.getElementById('enabled_status').textContent = "Waiting";
    });
}

function enable_script() {
    chrome.runtime.sendMessage({
        msg: "start"
    }, function(response) {
        if (response.farewell == "no enabled sites") {
            status_alert("alerts", "You must enable at least one site.", 10000);
            disable_script();
        } else {
            chrome.storage.local.set({
                enabled: "Running"
            }, function() {
                document.getElementById('enabled_status').textContent = "Running";
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function() {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function() {
                chrome.tabs.create({
                    active: true,
                    url: location
                });
            };
        })();
    }
});

document.getElementById('disable').addEventListener('click', disable_script);
document.getElementById('enable').addEventListener('click', enable_script);