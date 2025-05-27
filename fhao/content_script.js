chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getFhao") {
        const bodyText = document.body.innerText;
        const regex = /[A-Za-z]{3,5}-[0-9]{3,5}/g;
        const matches = bodyText.match(regex);
        console.log('番号匹配结果:', matches);
        sendResponse({ fhao: matches || [] });
    }
    if (request.action === "getMagnet") {
   
         const bodyText = document.body.innerText;
        const regex = /magnet:\?xt=urn:btih:[a-zA-Z0-9]{32,40}/g;
        const matches = bodyText.match(regex);
        console.log('番号匹配结果:', matches);
        sendResponse({ magnets: matches || [] });
    }
    return true; // 允许异步响应
}); 