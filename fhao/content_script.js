chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getFhao") {
        const bodyText = document.body.innerText;
        const regex = /[A-Za-z]{3,5}-[0-9]{3,5}/g;
        const matches = bodyText.match(regex);
        console.log('番号匹配结果:', matches);
        sendResponse({ fhao: matches || [] });
    }
    if (request.action === "getMagnet") {
        // 1. 从所有 a 标签 href 抓取
        const links = Array.from(document.querySelectorAll('a[href^="magnet:"]'));
        const hrefMagnets = links.map(link => link.href);
    
        // 2. 从 body 文本抓取
        const bodyText = document.body.innerText;
        const regex = /magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}\S*/g;
        const textMagnets = bodyText.match(regex) || [];
    
        // 3. 合并去重并只保留哈希部分
        const magnets = Array.from(new Set([...hrefMagnets, ...textMagnets]))
            .map(magnet => {
                const match = magnet.match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}/);
                return match ? match[0] : null;
            })
            .filter(Boolean);
    
        console.log('磁力匹配结果:', magnets);
        sendResponse({ magnets });
    }
    return true; // 允许异步响应
}); 