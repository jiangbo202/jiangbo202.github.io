// 事项管理页面 JavaScript
class DashboardManager {
    constructor() {
        this.categories = window.dashboardData?.categories || {};
        this.dailyProgress = window.dashboardData?.dailyProgress || {};
        this.currentView = 'month';
        
        // 始终使用当前日期作为初始显示
        this.currentDate = new Date();
        console.log('Dashboard初始化，使用当前日期:', this.currentDate);
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initProgressCircles();
        this.renderMonthCalendar();
        this.setupModal();
    }
    
    initProgressCircles() {
        // 初始化当前任务的圆环进度
        document.querySelectorAll('.task-circle').forEach(circle => {
            const progress = parseInt(circle.getAttribute('data-progress'));
            const color = circle.getAttribute('data-color');
            const degree = (progress / 100) * 360;
            
            circle.style.setProperty('--progress-color', color);
            circle.style.setProperty('--progress-deg', `${degree}deg`);
        });
    }
    
    bindEvents() {
        // 视图切换
        document.getElementById('month-view')?.addEventListener('click', () => {
            this.switchView('month');
        });
        
        document.getElementById('year-view')?.addEventListener('click', () => {
            this.switchView('year');
        });
        
        // 月份导航
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.navigateMonth(-1);
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            this.navigateMonth(1);
        });
        
        // 年份导航
        document.getElementById('prev-year')?.addEventListener('click', () => {
            this.navigateYear(-1);
        });
        
        document.getElementById('next-year')?.addEventListener('click', () => {
            this.navigateYear(1);
        });
    }
    
    switchView(view) {
        this.currentView = view;
        
        // 更新按钮状态
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${view}-view`).classList.add('active');
        
        // 切换视图
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${view}-calendar`).classList.add('active');
        
        if (view === 'month') {
            this.renderMonthCalendar();
        } else {
            this.renderYearView();
        }
    }
    
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderMonthCalendar();
    }
    
    navigateYear(direction) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + direction);
        if (this.currentView === 'year') {
            this.renderYearView();
        } else {
            this.renderMonthCalendar();
        }
    }
    
    renderMonthCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新标题
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        
        const monthElement = document.getElementById('current-month');
        const titleText = `${year}年${monthNames[month]}`;
        
        console.log(`渲染日历: ${titleText}`);
        
        if (monthElement) {
            monthElement.textContent = titleText;
        }
        
        // 获取月份信息
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarBody = document.getElementById('calendar-body');
        calendarBody.innerHTML = '';
        
        // 生成日历
        let currentDate = new Date(startDate);
        const today = new Date();
        
        for (let week = 0; week < 6; week++) {
            const row = document.createElement('div');
            row.className = 'calendar-body-row';
            
            for (let day = 0; day < 7; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell calendar-date';
                
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = this.isSameDate(currentDate, today);
                const dateString = this.formatDate(currentDate);
                
                if (!isCurrentMonth) {
                    cell.classList.add('other-month');
                }
                
                if (isToday) {
                    cell.classList.add('today');
                }
                
                // 日期数字
                const dateNumber = document.createElement('div');
                dateNumber.className = 'date-number';
                dateNumber.textContent = currentDate.getDate();
                cell.appendChild(dateNumber);
                
                // 进度圆圈
                if (isCurrentMonth) {
                    const progressContainer = document.createElement('div');
                    progressContainer.className = 'date-progress';
                    
                    const dayProgress = this.dailyProgress[dateString];
                    
                    if (dayProgress) {
                        console.log(`${dateString} 有进度数据:`, dayProgress);
                        this.renderProgressCircles(progressContainer, dayProgress);
                        
                        // 添加悬浮事件
                        this.addDateHoverEvents(cell, dateString, dayProgress);
                    }
                    
                    cell.appendChild(progressContainer);
                }
                
                row.appendChild(cell);
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            calendarBody.appendChild(row);
            
            // 如果已经到下个月且这一行都是下个月的日期，就停止
            if (currentDate.getMonth() !== month && week >= 4) {
                break;
            }
        }
    }
    
    renderProgressCircles(container, dayProgress) {
        Object.entries(this.categories).forEach(([key, category]) => {
            const progress = dayProgress[key] || 0;
            const target = category.daily_target;
            const percentage = Math.min(progress / target, 2); // 最大200%（超额完成）
            
            if (progress > 0) {
                const circle = this.createProgressCircle(category, progress, target, percentage);
                container.appendChild(circle);
            }
        });
    }
    
    createProgressCircle(category, progress, target, percentage) {
        const circle = document.createElement('div');
        circle.className = 'progress-circle';
        circle.title = `${category.name}: ${progress}${category.unit}/${target}${category.unit} (${Math.round(percentage * 100)}%)`;
        
        // 创建SVG来绘制更平滑的圆饼
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 18 18');
        svg.style.display = 'block';
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // 背景圆
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', '9');
        bgCircle.setAttribute('cy', '9');
        bgCircle.setAttribute('r', '8');
        bgCircle.setAttribute('fill', 'rgba(0,0,0,0.1)');
        bgCircle.setAttribute('stroke', 'rgba(0,0,0,0.1)');
        bgCircle.setAttribute('stroke-width', '1');
        svg.appendChild(bgCircle);
        
        if (percentage <= 1) {
            // 正常完成 - 绘制扇形或完整圆
            if (percentage >= 1) {
                // 100% - 绘制完整圆形
                const fullCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                fullCircle.setAttribute('cx', '9');
                fullCircle.setAttribute('cy', '9');
                fullCircle.setAttribute('r', '8');
                fullCircle.setAttribute('fill', category.color);
                svg.appendChild(fullCircle);
            } else if (percentage > 0) {
                // 小于100% - 绘制扇形
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const angle = percentage * 360;
                const endAngle = (angle - 90) * Math.PI / 180;
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const x1 = 9 + 8 * Math.cos(-Math.PI/2);
                const y1 = 9 + 8 * Math.sin(-Math.PI/2);
                const x2 = 9 + 8 * Math.cos(endAngle);
                const y2 = 9 + 8 * Math.sin(endAngle);
                
                const pathData = `M 9 9 L ${x1} ${y1} A 8 8 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                path.setAttribute('d', pathData);
                path.setAttribute('fill', category.color);
                svg.appendChild(path);
            }
        } else {
            // 超额完成 - 完整圆圈 + 内圈
            const fullCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            fullCircle.setAttribute('cx', '9');
            fullCircle.setAttribute('cy', '9');
            fullCircle.setAttribute('r', '8');
            fullCircle.setAttribute('fill', category.color);
            svg.appendChild(fullCircle);
            
            // 超额部分内圈
            const excess = percentage - 1;
            if (excess > 0) {
                const innerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const innerAngle = excess * 360;
                const innerEndAngle = (innerAngle - 90) * Math.PI / 180;
                const innerLargeArcFlag = innerAngle > 180 ? 1 : 0;
                
                const innerRadius = 5;
                const ix1 = 9 + innerRadius * Math.cos(-Math.PI/2);
                const iy1 = 9 + innerRadius * Math.sin(-Math.PI/2);
                const ix2 = 9 + innerRadius * Math.cos(innerEndAngle);
                const iy2 = 9 + innerRadius * Math.sin(innerEndAngle);
                
                const innerPathData = `M 9 9 L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${innerLargeArcFlag} 1 ${ix2} ${iy2} Z`;
                innerPath.setAttribute('d', innerPathData);
                innerPath.setAttribute('fill', this.lightenColor(category.color, 40));
                svg.appendChild(innerPath);
            }
        }
        
        circle.appendChild(svg);
        return circle;
    }
    
    addDateHoverEvents(cell, dateString, dayProgress) {
        let tooltip = null;
        
        cell.addEventListener('mouseenter', (e) => {
            // 创建工具提示
            tooltip = document.createElement('div');
            tooltip.className = 'date-tooltip';
            
            // 格式化日期显示
            const date = new Date(dateString);
            const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
            
            const title = document.createElement('div');
            title.className = 'tooltip-title';
            title.textContent = formattedDate;
            tooltip.appendChild(title);
            
            // 添加每个类别的进度
            Object.entries(this.categories).forEach(([key, category]) => {
                const progress = dayProgress[key] || 0;
                const target = category.daily_target;
                const percentage = Math.round((progress / target) * 100);
                
                const item = document.createElement('div');
                item.className = 'tooltip-progress-item';
                
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'tooltip-category';
                
                const colorDiv = document.createElement('div');
                colorDiv.className = 'tooltip-color';
                colorDiv.style.backgroundColor = category.color;
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = category.name;
                
                categoryDiv.appendChild(colorDiv);
                categoryDiv.appendChild(nameSpan);
                
                const progressDiv = document.createElement('div');
                progressDiv.className = 'tooltip-progress-value';
                progressDiv.textContent = `${progress}${category.unit}/${target}${category.unit} (${percentage}%)`;
                
                item.appendChild(categoryDiv);
                item.appendChild(progressDiv);
                tooltip.appendChild(item);
            });
            
            // 先设置样式并添加到DOM中
            tooltip.style.position = 'fixed';
            tooltip.style.top = '0px';
            tooltip.style.left = '0px';
            tooltip.style.opacity = '0';
            tooltip.style.zIndex = '1000';
            document.body.appendChild(tooltip);
            
            // 获取元素尺寸
            const rect = cell.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            console.log('Cell rect:', rect);
            console.log('Tooltip rect:', tooltipRect);
            
            // 计算位置（fixed定位不需要加滚动偏移）
            let top = rect.top - tooltipRect.height - 10;
            if (top < 10) {
                top = rect.bottom + 10;
            }
            
            // 水平居中对齐，确保不超出屏幕边界
            let left = rect.left + (rect.width - tooltipRect.width) / 2;
            
            // 确保不超出左边界
            if (left < 10) {
                left = 10;
            }
            // 确保不超出右边界
            else if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            
            // 应用最终位置
            console.log('Final position:', { top, left });
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.style.opacity = '0';
            
            // 延迟显示动画
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 50);
        });
        
        cell.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    }
    
    renderYearView() {
        const year = this.currentDate.getFullYear();
        document.getElementById('current-year').textContent = `${year}年`;
        
        const yearGrid = document.getElementById('year-grid');
        yearGrid.innerHTML = '';
        
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                           '7月', '8月', '9月', '10月', '11月', '12月'];
        
        for (let month = 0; month < 12; month++) {
            const monthCell = document.createElement('div');
            monthCell.className = 'month-cell';
            
            const monthName = document.createElement('div');
            monthName.className = 'month-name';
            monthName.textContent = monthNames[month];
            
            const monthProgress = document.createElement('div');
            monthProgress.className = 'month-progress';
            
            // 计算月度统计并创建迷你圆圈
            const monthStats = this.calculateMonthStats(year, month);
            
            Object.entries(this.categories).forEach(([key, category]) => {
                const monthData = monthStats[key] || { completed: 0, total: 0 };
                const completionRate = monthData.total > 0 ? monthData.completed / monthData.total : 0;
                
                const miniCircle = document.createElement('div');
                miniCircle.className = 'mini-progress-circle';
                miniCircle.style.backgroundColor = category.color;
                miniCircle.style.opacity = Math.max(0.3, completionRate); // 最小透明度30%
                
                // 添加数据属性用于工具提示
                miniCircle.setAttribute('data-category', key);
                miniCircle.setAttribute('data-completed', monthData.completed);
                miniCircle.setAttribute('data-total', monthData.total);
                miniCircle.setAttribute('data-rate', Math.round(completionRate * 100));
                
                monthProgress.appendChild(miniCircle);
            });
            
            monthCell.appendChild(monthName);
            monthCell.appendChild(monthProgress);
            
            // 添加悬浮事件
            this.addMonthHoverEvents(monthCell, monthStats);
            
            yearGrid.appendChild(monthCell);
        }
    }
    
    calculateMonthStats(year, month) {
        const stats = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        Object.keys(this.categories).forEach(key => {
            stats[key] = { completed: 0, total: daysInMonth };
        });
        
        // 遍历该月的所有日期
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = this.formatDate(date);
            const dayProgress = this.dailyProgress[dateString];
            
            if (dayProgress) {
                Object.keys(this.categories).forEach(key => {
                    const category = this.categories[key];
                    const progress = dayProgress[key] || 0;
                    if (progress >= category.daily_target) {
                        stats[key].completed++;
                    }
                });
            }
        }
        
        return stats;
    }
    
    addMonthHoverEvents(monthCell, monthStats) {
        let tooltip = null;
        
        monthCell.addEventListener('mouseenter', (e) => {
            // 创建工具提示
            tooltip = document.createElement('div');
            tooltip.className = 'month-tooltip';
            
            Object.entries(this.categories).forEach(([key, category]) => {
                const monthData = monthStats[key] || { completed: 0, total: 0 };
                const completionRate = monthData.total > 0 ? Math.round((monthData.completed / monthData.total) * 100) : 0;
                
                const tooltipItem = document.createElement('div');
                tooltipItem.className = 'tooltip-item';
                
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'tooltip-category';
                
                const colorDiv = document.createElement('div');
                colorDiv.className = 'tooltip-color';
                colorDiv.style.backgroundColor = category.color;
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = category.name;
                
                categoryDiv.appendChild(colorDiv);
                categoryDiv.appendChild(nameSpan);
                
                const progressDiv = document.createElement('div');
                progressDiv.className = 'tooltip-progress';
                progressDiv.textContent = `${monthData.completed}/${monthData.total}天 (${completionRate}%)`;
                
                tooltipItem.appendChild(categoryDiv);
                tooltipItem.appendChild(progressDiv);
                tooltip.appendChild(tooltipItem);
            });
            
            monthCell.appendChild(tooltip);
            
            // 延迟显示动画
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 50);
        });
        
        monthCell.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 200);
            }
        });
    }
    
    setupModal() {
        // 保留方法以避免错误，但现在使用悬浮提示替代模态框
    }
    
    showDateModal(dateString, dayProgress) {
        const modal = document.getElementById('date-modal');
        const modalDate = document.getElementById('modal-date');
        const modalProgress = document.getElementById('modal-progress');
        
        // 格式化日期显示
        const date = new Date(dateString);
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        modalDate.textContent = formattedDate;
        
        // 清空之前的内容
        modalProgress.innerHTML = '';
        
        // 显示每个类别的进度
        Object.entries(this.categories).forEach(([key, category]) => {
            const progress = dayProgress[key] || 0;
            const target = category.daily_target;
            const percentage = Math.round((progress / target) * 100);
            
            const item = document.createElement('div');
            item.className = 'modal-progress-item';
            
            const info = document.createElement('div');
            info.className = 'progress-info';
            
            const categorySpan = document.createElement('span');
            categorySpan.className = 'progress-category';
            categorySpan.style.backgroundColor = `${category.color}20`;
            categorySpan.style.color = category.color;
            categorySpan.textContent = category.name;
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'progress-value';
            valueSpan.textContent = `${progress}${category.unit} / ${target}${category.unit}`;
            
            const percentageSpan = document.createElement('span');
            percentageSpan.textContent = `${percentage}%`;
            percentageSpan.style.color = percentage >= 100 ? category.color : 'var(--secondary)';
            percentageSpan.style.fontWeight = percentage >= 100 ? 'bold' : 'normal';
            
            info.appendChild(categorySpan);
            info.appendChild(valueSpan);
            item.appendChild(info);
            item.appendChild(percentageSpan);
            
            modalProgress.appendChild(item);
        });
        
        modal.classList.add('show');
    }
    
    // 工具函数
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// 页面可见性变化时更新（用户切换标签页后回来）
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 页面重新可见时，可以在这里添加数据更新逻辑
        console.log('Dashboard page is now visible');
    }
});
