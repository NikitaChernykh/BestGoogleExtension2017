

//Check if the tab is Activated
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.query({active: true, currentWindow: true},function(tabs){
        console.log(tabs[0].url);
        console.log("prev tab at the begining of the query: "+ bgModule.prevTab);
        if(typeof bgModule.prevTab == "undefined"){
            bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
        }else{
            console.log("prev tab before status update: "+ bgModule.prevTab);
            bgModule.updateDeactivationTime(bgModule.prevTab);
            bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
        }
    });
    chrome.tabs.get(activeInfo.tabId, function(tab){
        if(chrome.runtime.lastError){
            var errorMsg = chrome.runtime.lastError.message;
            console.log(errorMsg);
        }else{
            if(tab.active && tab.url != "chrome://newtab/"){
                bgModule.tabUpdatedAndActiveCallback(tab.url, tab.favIconUrl);
                bgModule.globalURL = tab.url;
            }
        }
    });
});

//Check if the tab is Updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(tab.url != "chrome://newtab/"){
      //check for anactive tab reloading
      if (tab.active) {
          //comapre if the domain is the same
          if (!tab.url.includes(bgModule.extractDomain(bgModule.globalURL))) {
              if (changeInfo.status == "complete" && tab.status == "complete" && tab.url != undefined) {
                  if (tab.active && tab.url != "chrome://newtab/") {
                      bgModule.tabUpdatedAndActiveCallback(tab.url, tab.favIconUrl);
                      bgModule.updateDeactivationTime(bgModule.prevTab);
                      bgModule.prevTab = bgModule.extractDomain(tab.url);
                      bgModule.globalURL = tab.url;
                  }
              }
          }
      }
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "popup") {
        chrome.storage.local.get('websiteList', function (data) {
        console.log("LIST OF WEBSITES FROM STORAGE");
        console.log(data);
        });
    }
    if (request.action == "remove") {
        console.log(request.list);
        bgModule.websiteList = request.list;
    }
});

// Check if chome is out of focus or pc in sleep mode TODO in progress 
chrome.windows.onFocusChanged.addListener(function(window) {
    if (window == chrome.windows.WINDOW_ID_NONE) {
        inFocus = false;
        console.log("chrome is NOT active");
        console.log("I just stoped: " + bgModule.prevTab);
        bgModule.updateDeactivationTime(bgModule.prevTab);
        bgModule.globalURL = bgModule.prevTab;
    } else {
        inFocus = true;
        chrome.tabs.query({active: true, currentWindow: true},function(tabs){
            console.log("I just restarted: " + tabs[0].url);
            console.log("global was: " + bgModule.globalURL);
            bgModule.tabUpdatedAndActiveCallback(bgModule.extractDomain(tabs[0].url));
            bgModule.prevTab = bgModule.extractDomain(tabs[0].url);
            bgModule.globalURL = bgModule.extractDomain(tabs[0].url);
        });
        console.log("global now: " + bgModule.globalURL);
        console.log("chrome is active");
    }
});
