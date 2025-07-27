document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const itemsPerPage = 20;
    let totalPages = 1;
    let totalItems = 0;
    let currentSearch = '';

    // 格式化日期的函数
    function formatDate(dateString) {
        if (!dateString || dateString === "forever") return "永久";
        
        // 处理带微秒和时区的日期格式: 2025-07-27T07:04:56.089000 +0800
        let formattedString = dateString;
        if (dateString.includes('.')) {
            // 移除微秒部分并重新组合日期字符串
            const parts = dateString.split(' ');
            if (parts.length === 3) {
                // 格式为: 2025-07-27T07:04:56.089000 +0800
                const dateTimePart = parts[0].split('.')[0]; // 获取日期时间部分，去掉微秒
                const timezonePart = parts[2]; // 获取时区部分
                formattedString = dateTimePart + ' ' + timezonePart;
            } else {
                // 如果不是预期格式，尝试直接处理
                formattedString = dateString.split('.')[0];
            }
        }
        
        // 创建日期对象
        const date = new Date(formattedString);
        if (isNaN(date)) {
            // 如果还是无效日期，尝试其他格式
            const cleanedString = dateString.replace(/\.\d+/, '');
            const date2 = new Date(cleanedString);
            if (isNaN(date2)) {
                return "无效日期";
            }
            const year = date2.getFullYear();
            const month = String(date2.getMonth() + 1).padStart(2, '0');
            const day = String(date2.getDate()).padStart(2, '0');
            const hours = String(date2.getHours()).padStart(2, '0');
            const minutes = String(date2.getMinutes()).padStart(2, '0');
            const seconds = String(date2.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day}<br>${hours}:${minutes}:${seconds}`;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}<br>${hours}:${minutes}:${seconds}`;
    }

    // 搜索功能
    function searchBans() {
        const searchInput = document.getElementById('searchInput');
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchBanList();
    }

    // 重置搜索
    function resetSearch() {
        document.getElementById('searchInput').value = '';
        currentSearch = '';
        currentPage = 1;
        fetchBanList();
    }

    // 跳转到指定页面
    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            fetchBanList();
        }
    }

    // 获取封禁列表
    function fetchBanList() {
        // 显示加载指示器
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('banListTable').style.display = 'none';

        // 构造API URL
        let apiUrl = `https://api.kuke.ink/api/banlist?page=${currentPage}&per_page=${itemsPerPage}`;
        if (currentSearch) {
            apiUrl += `&search=${encodeURIComponent(currentSearch)}`;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // 更新分页信息
                totalItems = data.total;
                totalPages = data.pages;
                currentPage = data.current_page;

                // 显示数据
                displayBanList(data.data);

                // 更新分页控件
                updatePagination();

                // 隐藏加载指示器，显示表格
                document.getElementById('loadingIndicator').style.display = 'none';
                document.getElementById('banListTable').style.display = 'table';
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('loadingIndicator').innerHTML = '<p style="color: red;">加载失败，请重试。</p>';
            });
    }

    // 显示封禁列表
    function displayBanList(banData) {
        const banListBody = document.getElementById('banListBody');
        banListBody.innerHTML = '';

        if (!banData || banData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 20px;">
                    没有找到相关封禁记录
                </td>
            `;
            banListBody.appendChild(row);
            return;
        }

        banData.forEach(ban => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="ban-type">封禁</span></td>
                <td>
                    <img src="https://crafthead.net/avatar/${ban.name}" 
                         alt="${ban.name}'s avatar" 
                         class="avatar" 
                         style="margin-top: 3px; margin-bottom: 1px;" 
                         onerror="this.src='https://m.ccw.site/gandi_application/user_assets/b23d1f215b69e9782b51a2a324b9469e.png'; this.onerror=null;">
                    <br>${ban.name}
                </td>
                <td>
                    ${ban.source === '控制台'
                        ? `<img src="https://m.ccw.site/gandi_application/user_assets/b23d1f215b69e9782b51a2a324b9469e.png" alt="${ban.source}" class="avatar" style="margin-top: 3px; margin-bottom: 1px;"><br>${ban.source}`
                        : `<img src="https://crafthead.net/avatar/${ban.banned_by_name || ban.source}" alt="${ban.banned_by_name || ban.source}" class="avatar" style="margin-top: 3px; margin-bottom: 1px;" onerror="this.src='https://m.ccw.site/gandi_application/user_assets/b23d1f215b69e9782b51a2a324b9469e.png'; this.onerror=null;"><br>${ban.banned_by_name || ban.source}`
                    }
                </td>
                <td style="max-width: 400px;">KukeMC | ${ban.reason}</td>
                <td>${formatDate(ban.created)}</td>
                <td>
                    ${ban.expires === "forever" || ban.expires === null
                        ? (ban.active 
                            ? '<span class="highlight">永久封禁</span>'
                            : '<span class="highlight">永久封禁 (已解封 | 处理者: ' + (ban.removed_by_name || '未知') + ')</span>')
                        : (ban.active 
                            ? formatDate(ban.expires)
                            : formatDate(ban.created) + ' (已解封 | 处理者: ' + (ban.removed_by_name || '未知') + ')')
                    }
                </td>
                <td>${ban.server_scope}</td>
            `;
            banListBody.appendChild(row);
        });
    }

    // 更新分页控件
    function updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages <= 0) {
            return;
        }

        // 添加上一页按钮
        const prevBtn = document.createElement('li');
        prevBtn.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
        prevBtn.innerHTML = '<a class="page-link" href="#">上一页</a>';
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
        pagination.appendChild(prevBtn);

        // 添加页码按钮
        for (let i = 1; i <= totalPages; i++) {
            // 只显示当前页附近几页和第一页、最后一页
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                const pageBtn = document.createElement('li');
                pageBtn.className = 'page-item' + (i === currentPage ? ' active' : '');
                pageBtn.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    goToPage(i);
                });
                pagination.appendChild(pageBtn);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                // 添加省略号
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<a class="page-link" href="#">...</a>';
                pagination.appendChild(ellipsis);
            }
        }

        // 添加下一页按钮
        const nextBtn = document.createElement('li');
        nextBtn.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
        nextBtn.innerHTML = '<a class="page-link" href="#">下一页</a>';
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
        pagination.appendChild(nextBtn);

        // 添加总记录数信息
        const infoItem = document.createElement('li');
        infoItem.className = 'page-item disabled';
        infoItem.innerHTML = `<span class="page-link">共 ${totalItems} 条记录</span>`;
        pagination.appendChild(infoItem);
    }

    // 初始化页面
    fetchBanList();
    
    // 添加回车搜索功能
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBans();
        }
    });
    
    // 添加搜索按钮事件
    document.getElementById('searchButton').addEventListener('click', searchBans);
    
    // 添加重置按钮事件
    document.getElementById('resetButton').addEventListener('click', resetSearch);
});