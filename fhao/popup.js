function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function showToTextarea(list) {
    const fhaoTextarea = document.getElementById('fhao-textarea');
    if (list && list.length > 0) {
        fhaoTextarea.value = list.join('\n');
    } else {
        fhaoTextarea.value = "未找到内容";
    }
    autoResizeTextarea(fhaoTextarea);
}

document.addEventListener('DOMContentLoaded', () => {
    // 存储所有页的磁力链接
    let allMagnets = [];
    let currentPage = 0;
    let endPage = 0;
    const logDiv = document.getElementById('magnet-log');

    // 监听来自content script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "pageMagnetsLoaded") {
            console.log('Received magnets for page', message.page, ':', message.magnets);
            
            // 将当前页的磁力链接添加到总列表
            allMagnets.push(...message.magnets);
            
            // 更新文本框显示
            showToTextarea(allMagnets);
            
            // 更新日志显示当前进度
            logDiv.innerHTML += `<div>第 ${message.page} 页: 获取到 ${message.magnets.length} 个磁力链接</div>`;
            
            // 如果还有下一页，继续获取
            if (message.page < endPage) {
                currentPage = message.page + 1;
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { action: "gotoAndGetMagnet", page: currentPage }
                    );
                });
            } else {
                // 所有页面处理完成
                logDiv.innerHTML += `<div style="color: green; margin-top: 10px;">完成！共获取 ${allMagnets.length} 个磁力链接</div>`;
            }
        }
    });

    // 批量获取磁力按钮点击事件
    document.getElementById('batch-get-magnet-btn').onclick = function() {
        const startPage = parseInt(document.getElementById('startPage').value, 10);
        endPage = parseInt(document.getElementById('endPage').value, 10);
        if (!startPage || !endPage || startPage > endPage) {
            alert('请输入有效的起始页和结束页');
            return;
        }

        // 重置状态
        allMagnets = [];
        currentPage = startPage;
        logDiv.innerHTML = ''; // 清空日志
        logDiv.innerHTML += `<div>开始获取第 ${startPage} 页到第 ${endPage} 页的磁力链接...</div>`;

        // 开始获取第一页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "gotoAndGetMagnet", page: currentPage }
            );
        });
    };

    // 获取番号
    document.getElementById('get-fhao-btn').onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "getFhao" },
                (response) => {
                    showToTextarea(response && response.fhao);
                }
            );
        });
    };

    // 获取磁力链接
    document.getElementById('get-magnet-btn').onclick = function() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "getMagnet" },
                (response) => {
                    showToTextarea(response && response.magnets);
                }
            );
        });
    };

    // 全选并复制
    document.getElementById('copy-btn').onclick = function() {
        const textarea = document.getElementById('fhao-textarea');
        textarea.select();
        document.execCommand('copy');
    };
  document.getElementById('clear-btn').onclick = function() {
        const textarea = document.getElementById('fhao-textarea');
        
        textarea.value = '';
        autoResizeTextarea(textarea);
    };
});
