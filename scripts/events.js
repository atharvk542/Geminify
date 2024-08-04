var selectedText;

// Creates both context menu options
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "gmnexplain",
        title: "Let Gemini Explain this",
        type: 'normal',
        contexts: ['selection'],
    });

    chrome.contextMenus.create({
        id: "gmninput",
        title: "Ask Gemini a question about this",
        type: "normal",
        contexts: ["selection"]
    });
});

// Detects clicking on context menu options
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    let selectedText = info.selectionText;

    // Save the selected text to local storage
    chrome.storage.local.set({ 'selectedText': selectedText }, function () {
        // Displays the correct popup depending on which context menu option was selected
        if (info.menuItemId === "gmnexplain") {
            // Saves the type of query to storage to be used later
            chrome.storage.local.set({ 'type': 'explain' })

            chrome.windows.create({
                url: chrome.runtime.getURL("popups/explainpopup.html"),
                type: "popup",
                width: 600,
                height: 400
            });
        }

        else if (info.menuItemId === "gmninput") {
            chrome.storage.local.set({ 'type': 'input' })

            chrome.windows.create({
                url: chrome.runtime.getURL("popups/inputpopup.html"),
                type: "popup",
                width: 600,
                height: 400
            });
        }
    });
});