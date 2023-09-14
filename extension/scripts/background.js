chrome.action.onClicked.addListener((tab) => {
    console.log('Clicked!');
    console.log(tab);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['scripts/sync.js'],
    }).then(() => { console.log('Injected sync.js'); });
});