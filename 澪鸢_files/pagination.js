// pagination.js - 新版：显示 上一页 页码 下一页 (当前页/总页数)
(function() {
    const ITEMS_PER_PAGE = 5;          // 每页显示数量
    const MAX_VISIBLE_PAGES = 5;       // 最多显示的页码个数
    let currentPage = 1;
    let totalPages = 1;
    let allCards = [];

    const cardsContainer = document.getElementById('cardsContainer');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!cardsContainer || !paginationContainer) return;

    function collectCards() {
        return Array.from(cardsContainer.querySelectorAll(':scope > .card-item'));
    }

    function renderPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        allCards.forEach((card, idx) => {
            card.style.display = (idx >= start && idx < end) ? '' : 'none';
        });

        updatePaginationUI();
        const scrollArea = document.querySelector('.cards-scroll-area');
        if (scrollArea) scrollArea.scrollTop = 0;
    }

    function updatePaginationUI() {
        totalPages = Math.ceil(allCards.length / ITEMS_PER_PAGE) || 1;
        paginationContainer.innerHTML = '';

        // 1. 上一页
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '< 上一页';
        prevBtn.className = `pagination-btn px-3 py-1.5 rounded-lg text-sm border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`;
        if (currentPage !== 1) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        paginationContainer.appendChild(prevBtn);

        // 2. 页码（只显示附近几个）
        let startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
        let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);
        if (endPage - startPage < MAX_VISIBLE_PAGES - 1) {
            startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = `page-number pagination-btn w-9 h-9 rounded-full text-sm mx-1 ${i === currentPage ? 'active bg-pink-500 text-white' : 'bg-white border hover:bg-gray-100'}`;
            if (i !== currentPage) pageBtn.addEventListener('click', () => goToPage(i));
            paginationContainer.appendChild(pageBtn);
        }

        // 3. 下一页
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '下一页 >';
        nextBtn.className = `pagination-btn px-3 py-1.5 rounded-lg text-sm border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`;
        if (currentPage !== totalPages) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        paginationContainer.appendChild(nextBtn);

        // 4. 显示当前页/总页数，用括号括住，放在“下一页”后面平行显示
        const pageInfoSpan = document.createElement('span');
        pageInfoSpan.textContent = `(${currentPage}/${totalPages})`;
        pageInfoSpan.className = 'ml-3 text-sm text-gray-600 dark:text-gray-400';
        paginationContainer.appendChild(pageInfoSpan);
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;
        currentPage = page;
        renderPage(currentPage);
    }

    function initPagination() {
        allCards = collectCards();
        if (allCards.length === 0) return;
        allCards.forEach(card => (card.style.display = 'none'));
        renderPage(1);
    }

    initPagination();
})();