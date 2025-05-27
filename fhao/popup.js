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
    // 默认获取磁力链接
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getMagnet" },
            (response) => {
                showToTextarea(response && response.magnets);
            }
        );
    });

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
}); 