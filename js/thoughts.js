// 随想录页面交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 分页功能
    class ThoughtsPagination {
        constructor() {
            this.currentPage = 1;
            this.itemsPerPage = 10;
            this.allEntries = [];
            this.filteredEntries = [];
            this.activeTag = null;
            
            this.init();
        }
        
        init() {
            this.collectAllEntries();
            this.setupEventListeners();
            this.updateDisplay();
        }
        
        collectAllEntries() {
            // 收集所有的思考条目，按时间倒序排列
            const timelineItems = document.querySelectorAll('.timeline-item');
            this.allEntries = [];
            
            timelineItems.forEach(item => {
                const period = item.dataset.period;
                const entries = item.querySelectorAll('.thought-entry');
                
                entries.forEach(entry => {
                    this.allEntries.push({
                        element: entry,
                        timelineItem: item,
                        period: period,
                        time: entry.dataset.time,
                        tags: Array.from(entry.querySelectorAll('.tag')).map(tag => tag.textContent)
                    });
                });
            });
            
            // 按时间倒序排列（最新的在前面）
            this.allEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
            this.filteredEntries = [...this.allEntries];
        }
        
        setupEventListeners() {
            // 分页按钮事件
            document.getElementById('prev-page').addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateDisplay();
                }
            });
            
            document.getElementById('next-page').addEventListener('click', () => {
                if (this.currentPage < this.getTotalPages()) {
                    this.currentPage++;
                    this.updateDisplay();
                }
            });
            
            // 每页显示数量变更事件
            document.getElementById('items-per-page').addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.updateDisplay();
            });
            
            // 标签筛选事件
            document.querySelectorAll('.tag').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    this.handleTagFilter(e.target.textContent);
                });
            });
        }
        
        handleTagFilter(tagText) {
            if (this.activeTag === tagText) {
                // 取消筛选
                this.activeTag = null;
                this.filteredEntries = [...this.allEntries];
                document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            } else {
                // 应用筛选
                this.activeTag = tagText;
                this.filteredEntries = this.allEntries.filter(entry => 
                    entry.tags.includes(tagText)
                );
                
                // 更新标签样式
                document.querySelectorAll('.tag').forEach(t => {
                    t.classList.toggle('active', t.textContent === tagText);
                });
            }
            
            this.currentPage = 1;
            this.updateDisplay();
        }
        
        getTotalPages() {
            return Math.ceil(this.filteredEntries.length / this.itemsPerPage);
        }
        
        getCurrentPageEntries() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.filteredEntries.slice(startIndex, endIndex);
        }
        
        updateDisplay() {
            this.hideAllEntries();
            this.showCurrentPageEntries();
            this.updatePaginationControls();
            this.updatePaginationInfo();
            this.scrollToTop();
        }
        
        hideAllEntries() {
            // 隐藏所有时间线项目
            document.querySelectorAll('.timeline-item').forEach(item => {
                item.classList.add('hidden');
            });
        }
        
        showCurrentPageEntries() {
            const currentEntries = this.getCurrentPageEntries();
            const visiblePeriods = new Set();
            
            // 显示当前页的条目
            currentEntries.forEach(entryData => {
                entryData.timelineItem.classList.remove('hidden');
                entryData.timelineItem.classList.add('fade-in');
                visiblePeriods.add(entryData.period);
                
                // 隐藏同一时间段内不在当前页的条目
                const allEntriesInPeriod = entryData.timelineItem.querySelectorAll('.thought-entry');
                allEntriesInPeriod.forEach(entry => {
                    const isCurrentPageEntry = currentEntries.some(ce => ce.element === entry);
                    entry.style.display = isCurrentPageEntry ? '' : 'none';
                });
            });
            
            // 确保每个显示的时间段至少有一个可见的条目
            document.querySelectorAll('.timeline-item').forEach(item => {
                if (!item.classList.contains('hidden')) {
                    const visibleEntries = Array.from(item.querySelectorAll('.thought-entry'))
                        .filter(entry => entry.style.display !== 'none');
                    
                    if (visibleEntries.length === 0) {
                        item.classList.add('hidden');
                    }
                }
            });
        }
        
        updatePaginationControls() {
            const totalPages = this.getTotalPages();
            
            // 更新上一页/下一页按钮
            document.getElementById('prev-page').disabled = this.currentPage === 1;
            document.getElementById('next-page').disabled = this.currentPage === totalPages;
            
            // 生成页码按钮
            this.generatePageNumbers(totalPages);
        }
        
        generatePageNumbers(totalPages) {
            const numbersContainer = document.getElementById('pagination-numbers');
            numbersContainer.innerHTML = '';
            
            if (totalPages <= 1) return;
            
            const maxVisiblePages = 7;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // 调整起始页，确保显示足够的页码
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // 添加第一页和省略号
            if (startPage > 1) {
                this.createPageButton(1);
                if (startPage > 2) {
                    this.createEllipsis();
                }
            }
            
            // 添加页码按钮
            for (let i = startPage; i <= endPage; i++) {
                this.createPageButton(i);
            }
            
            // 添加省略号和最后一页
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    this.createEllipsis();
                }
                this.createPageButton(totalPages);
            }
        }
        
        createPageButton(pageNum) {
            const button = document.createElement('button');
            button.className = `page-number ${pageNum === this.currentPage ? 'active' : ''}`;
            button.textContent = pageNum;
            button.addEventListener('click', () => {
                this.currentPage = pageNum;
                this.updateDisplay();
            });
            document.getElementById('pagination-numbers').appendChild(button);
        }
        
        createEllipsis() {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            document.getElementById('pagination-numbers').appendChild(ellipsis);
        }
        
        updatePaginationInfo() {
            const totalEntries = this.filteredEntries.length;
            const totalPages = this.getTotalPages();
            
            document.getElementById('current-page-info').textContent = 
                `第 ${this.currentPage} 页，共 ${totalPages} 页`;
            
            document.getElementById('total-entries').textContent = 
                `共 ${totalEntries} 条随想${this.activeTag ? ` (筛选: ${this.activeTag})` : ''}`;
        }
        
        scrollToTop() {
            document.querySelector('.thoughts-header').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    // 初始化分页功能
    const pagination = new ThoughtsPagination();
    
    // 为长内容添加展开功能
    const thoughtTexts = document.querySelectorAll('.thought-text');
    
    thoughtTexts.forEach(text => {
        if (text.scrollHeight > text.clientHeight) {
            text.style.cursor = 'pointer';
            text.title = '点击查看完整内容';
            
            text.addEventListener('click', function() {
                this.style.maxHeight = this.style.maxHeight ? '' : 'none';
            });
        }
    });
});
