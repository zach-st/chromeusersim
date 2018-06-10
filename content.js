function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clickRandomLink(sendResponse) {
    // construct query selector
    var domain = document.location.href.match(/(((https?\:\/\/)?([-a-z0-9]+(\.[-a-z0-9]{2,}){1,2}))($|\s|\/.*))/i);
    // [2] is domain with the protocol,
    // [4] is domian without the protocol
    var basicQS, no_domain_QS, onsite_with_protocol_QS, onsite_with_domain_QS;
    // don't open new windows, email programs, or javascript links
    basicQS = ":not([target]):not([href^='mailto']):not([href^='javascript'])";
    // if there's no domain in the list, it's onsite
    no_domain_QS = "a[href]" + basicQS + ":not([href^='http'])";
    // if it points to its own domain with protocol, it's onsite
    onsite_with_protocol_QS = "a[href^='" + domain[2] + "']" + basicQS;
    // if it points to its own domain by domain name only, it's onsite
    onsite_with_domain_QS = "a[href^='" + domain[4] + "']" + basicQS;
    var full_QS = no_domain_QS + ", " + onsite_with_protocol_QS + ", " + onsite_with_domain_QS;
    var elements = document.querySelectorAll(no_domain_QS + ", " + onsite_with_protocol_QS + ", " + onsite_with_domain_QS);
    if (elements.length > 0) {
        //pick one at random and click it
        var num = getRandomIntInclusive(0, elements.length - 1);
        var element = elements[num];
        element.click();
        sendResponse(element.href);
    } else {
        sendResponse("linkclick failed");
    }
}

// Listen for messages
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.text === 'click link') {
        clickRandomLink(function(result) {
            sendResponse(result);
        });
    }
});