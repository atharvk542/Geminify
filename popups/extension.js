document.addEventListener('DOMContentLoaded', function () {
    // Creates options in the extension popup for adjusting temperature and autoclose
    const autoCloseSwitch = document.getElementById('autoCloseSwitch');
    const temperatureInput = document.getElementById('temperatureInput');

    chrome.storage.local.get(['autoclose', 'temperature'], function (data) {
        if (data.autoclose !== undefined) {
            autoCloseSwitch.checked = data.autoclose;
        }
        if (data.temperature !== undefined) {
            temperatureInput.value = data.temperature;
        }
    });
    
    autoCloseSwitch.addEventListener('change', function () {
        chrome.storage.local.set({ 'autoclose': autoCloseSwitch.checked })
    });

    temperatureInput.addEventListener('input', function () {
        chrome.storage.local.set({ 'temperature': temperatureInput.value })
    });
});
