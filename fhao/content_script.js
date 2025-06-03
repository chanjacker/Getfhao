function getPageUrl(page) {
    const url = new URL(window.location.href);
    // 检查当前URL是否使用 'page' 参数
    const currentPage = url.searchParams.get('page');
    if (currentPage !== null) {
        url.searchParams.set('page', page);
    } else {
        url.searchParams.set('p', page);
    }
    return url.toString();
}

function convertFeatureCodeToMagnet(featureCode) {
    // Remove any spaces and special characters
    const cleanCode = featureCode.replace(/[【】\s：]/g, '');
    return `magnet:?xt=urn:btih:${cleanCode}`;
}

// 添加页面加载完成后的处理
window.addEventListener('load', () => {
    // 检查URL中是否包含目标页码
    const urlParams = new URLSearchParams(window.location.search);
    const targetPage = urlParams.get('p') || urlParams.get('page');
    
    if (targetPage) {
        console.log('Page loaded, target page:', targetPage);
        // 等待页面内容加载完成
        setTimeout(() => {
            // 获取磁力链接
            const links = Array.from(document.querySelectorAll('a[href^="magnet:"]'));
            const hrefMagnets = links.map(link => link.href);
            const bodyText = document.body.innerText;
            const regex = /magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}\S*/g;
            const textMagnets = bodyText.match(regex) || [];
            const magnets = Array.from(new Set([...hrefMagnets, ...textMagnets]))
                .map(magnet => {
                    const match = magnet.match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}/);
                    return match ? match[0] : null;
                })
                .filter(Boolean);
            
            console.log('Magnets found on page', targetPage, ':', magnets);
            
            // 发送消息给popup
            chrome.runtime.sendMessage({
                action: "pageMagnetsLoaded",
                page: parseInt(targetPage),
                magnets: magnets
            });
        }, 3000);
    }
});

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
        let magnets = Array.from(new Set([...hrefMagnets, ...textMagnets]))
            .map(magnet => {
                const match = magnet.match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}/);
                return match ? match[0] : null;
            })
            .filter(Boolean);
        if (magnets.length === 0) {
            // 匹配特徵碼格式
            const featureCodeRegex = /【特\s*徵\s*碼\s*】：([0-9a-fA-F]{32,64})/g;
            const featureCodes = [...bodyText.matchAll(featureCodeRegex)].map(match => convertFeatureCodeToMagnet(match[1]));
            
            magnets = Array.from(new Set([...hrefMagnets, ...textMagnets, ...featureCodes]))
                .map(magnet => {
                    const match = magnet.match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}/);
                    return match ? match[0] : null;
                })
                .filter(Boolean);
        }
    
        console.log('磁力匹配结果:', magnets);
        sendResponse({ magnets });
    }
    if (request.action === "gotoAndGetMagnet" && request.page) {
        // 生成目标页URL
        const targetUrl = getPageUrl(request.page);
        console.log('Target URL:', targetUrl);
        
        if (window.location.href !== targetUrl) {
            // 如果不在目标页，先跳转
            window.location.href = targetUrl;
            // 跳转后，content_script 会重新加载
            // 不需要在这里发送响应，因为页面会重新加载
        } else {
            // 已在目标页，等待页面加载完成后抓取
            setTimeout(() => {
                // 复用 getMagnet 逻辑
                const links = Array.from(document.querySelectorAll('a[href^="magnet:"]'));
                const hrefMagnets = links.map(link => link.href);
                const bodyText = document.body.innerText;
                const regex = /magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}\S*/g;
                const textMagnets = bodyText.match(regex) || [];
                const magnets = Array.from(new Set([...hrefMagnets, ...textMagnets]))
                    .map(magnet => {
                        const match = magnet.match(/magnet:\?xt=urn:btih:[0-9a-zA-Z]{32,64}/);
                        return match ? match[0] : null;
                    })
                    .filter(Boolean);
                console.log('Magnets found:', magnets);
                sendResponse({ magnets });
            }, 3000);
        }
    }
    return true; // 允许异步响应
}); 




