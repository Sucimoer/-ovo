// highlight.js - 精准高亮匹配文字（仅文字本身，不标注块级元素）
(function() {
    // 获取 search 参数
    const urlParams = new URLSearchParams(window.location.search);
    let keyword = urlParams.get('search');
    if (!keyword) return;

    let searchText = '';
    try {
        searchText = decodeURIComponent(keyword).trim();
    } catch(e) {
        searchText = keyword.trim();
    }
    if (searchText === '') return;

    // 避免高亮过大、过短的关键词
    if (searchText.length < 1) return;

    // 转义正则特殊字符
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 全局高亮函数（仅高亮文本节点中的匹配词）
    function highlightText(root, word) {
        const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // 跳过 script, style 以及已经高亮的区域
                    if (node.parentElement && 
                        (node.parentElement.tagName === 'SCRIPT' ||
                         node.parentElement.tagName === 'STYLE' ||
                         node.parentElement.classList?.contains('search-highlight-mark'))) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // 跳过导航栏、底部（可选，避免干扰）
                    if (node.parentElement?.closest('nav, footer')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        textNodes.forEach(node => {
            const text = node.textContent;
            if (regex.test(text)) {
                const span = document.createElement('span');
                span.className = 'search-highlight-mark';
                span.innerHTML = text.replace(regex, `<mark class="search-highlight-text">$1</mark>`);
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    // 移除所有高亮，恢复原始文本
    function removeHighlights() {
        const marks = document.querySelectorAll('.search-highlight-mark');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            const text = mark.innerText;
            const textNode = document.createTextNode(text);
            parent.replaceChild(textNode, mark);
            parent.normalize();
        });
    }

    // 添加高亮样式
    if (!document.getElementById('search-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'search-highlight-style';
        style.textContent = `
            mark.search-highlight-text {
                background-color: #ffec9f;
                color: #1e293b;
                padding: 0 2px;
                border-radius: 4px;
                font-weight: normal;
                box-shadow: 0 0 0 1px #ffb347;
            }
            html.dark mark.search-highlight-text {
                background-color: #fbbf24;
                color: #0f172a;
                box-shadow: 0 0 0 1px #f59e0b;
            }
        `;
        document.head.appendChild(style);
    }

    // 显示提示条
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed; top:70px; left:50%; transform:translateX(-50%); background:#1e293b; color:#fff; padding:8px 20px; border-radius:40px; font-size:14px; z-index:10000; backdrop-filter:blur(8px); opacity:0.9; transition:opacity 0.3s;';
    toast.textContent = `🔍 正在高亮 “${searchText}” ...`;
    document.body.appendChild(toast);

    // 先移除已有高亮，再重新高亮
    removeHighlights();
    highlightText(document.body, searchText);

    const hasHighlights = document.querySelectorAll('mark.search-highlight-text').length > 0;
    if (hasHighlights) {
        toast.textContent = `✅ 已高亮 “${searchText}” 相关内容`;
        // 滚动到第一个高亮位置
        const firstMark = document.querySelector('mark.search-highlight-text');
        if (firstMark) {
            firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        toast.textContent = `❌ 未找到 “${searchText}” 相关内容`;
    }
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2800);
})();