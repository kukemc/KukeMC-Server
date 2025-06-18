$(document).ready(function () {
    // 加载导航栏和页脚
    $("#navbar").load("navbar.html");
    $("#footer").load("footer.html");

    // 初始变量
    let currentPage = 1;
    let currentDays = 0; // 0表示不限时间
    let searchQuery = "";
    let totalItems = 0;
    let sortBy = "playtime"; // 默认按游玩时间排序

    // 加载概览数据
    loadOverview();

    // 加载排行榜数据
    loadRankingData();

    // 时间筛选下拉菜单变化事件
    $("#timeFilter").change(function () {
        currentDays = parseInt($(this).val());
        currentPage = 1;
        loadRankingData();
    });

    // 排序方式下拉菜单变化事件
    $("#sortFilter").change(function () {
        sortBy = $(this).val();
        currentPage = 1;
        loadRankingData();
    });

    // 搜索框输入事件
    // 统一搜索事件处理
    let searchTimeout;
    const handleSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = $("#searchInput").val().trim();
            currentPage = 1;
            // 显示加载动画
            $("#tableLoader").show();
            loadRankingData();
        }, 500);
    };

    // 搜索按钮点击事件
    $("#searchBtn").click(handleSearch);

    // 回车键搜索
    $("#searchInput").keypress(function (e) {
        if (e.which === 13) {
            handleSearch();
        }
    });

    // 输入框实时搜索
    $("#searchInput").on("input", handleSearch);

    // 加载概览数据函数
    function loadOverview() {
        $.ajax({
            url: "https://api.kuke.ink/api/playtime/overview",
            type: "GET",
            dataType: "json",
            success: function (data) {
                $("#totalPlayers").text(data.total_players);
                $("#todayOnline").text(data.today_online);
                $("#activePlayers").text(data.active_players);
                $("#totalPlaytime").text(data.total_playtime);
            },
            error: function () {
                $("#totalPlayers").text("加载失败");
                $("#todayOnline").text("加载失败");
                $("#activePlayers").text("加载失败");
                $("#totalPlaytime").text("加载失败");
            }
        });
    }

    // 加载排行榜数据函数
    function loadRankingData() {
        // 更新表头显示
        $('#loginCountHeader').text(currentDays === 0 ? '登录次数' : '游玩天数');
        // 显示加载中，不影响滚动位置
        $("#rankingBody").html('');
        // 显示加载动画
        $("#tableLoader").show();
        // 保持当前滚动位置
        let scrollPos = $(window).scrollTop();

        // 确定API端点
        let apiUrl = currentDays === 0 ?
            "https://api.kuke.ink/api/playtime/total_ranking" :
            "https://api.kuke.ink/api/playtime/recent_ranking";

        // 准备参数
        let params = {
            page: currentPage,
            per_page: 30
        };

        // 如果是近期排行榜，添加天数参数
        if (currentDays > 0) {
            params.days = currentDays;
        }

        // 如果有搜索查询，添加搜索参数
        if (searchQuery) {
            params.search = searchQuery;
        }

        // 添加排序参数
        params.sort_by = sortBy;

        $.ajax({
            url: apiUrl,
            type: "GET",
            data: params,
            dataType: "json",
            success: function (response) {
                // 清空表格
                $("#rankingBody").empty();
                // 隐藏加载动画
                $("#tableLoader").hide();
                // 恢复滚动位置
                $(window).scrollTop(scrollPos);

                // 检查是否有数据
                if (response.data && response.data.length > 0) {
                    // 计算起始排名
                    let startRank = (currentPage - 1) * 30 + 1;

                    // 遍历数据并添加到表格
                    response.data.forEach((player, index) => {
                        let rank = startRank + index;
                        let row = $('<tr>');

                        // 格式化在线时长
                        let playtime = currentDays === 0 ? player.total_playtime : player.recent_playtime;
                        let totalSeconds = Math.floor(Number(playtime) / 1000);
                        let hours = Math.floor(totalSeconds / 3600);
                        let minutes = Math.floor((totalSeconds % 3600) / 60);
                        let playtimeStr = hours === 0 ? minutes + '分钟' : hours + '小时' + minutes + '分钟';

                        // 格式化最近登录时间
                        let lastLoginDate = new Date(Date.parse(player.last_login));
                        let lastLoginStr = lastLoginDate.toLocaleString('zh-CN', { 
                            timeZone: 'UTC',
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: false
                        }).replace(/\//g, '-');

                        row.append($('<td>').attr('data-rank', rank).text('#' + rank));
                        row.append($('<td>').text(player.username));
                        row.append($('<td>').text(playtimeStr));
                        row.append($('<td>').text((currentDays === 0 ? player.login_count : player.play_days) + (currentDays === 0 ? ' 次' : ' 天')));
                        row.append($('<td>').text(lastLoginStr));

                        $("#rankingBody").append(row);
                    });

                    // 更新分页
                    updatePagination(response.pagination.total_pages);
                } else {
                    // 无数据显示
                    $("#rankingBody").html('<tr><td colspan="5" class="text-center">暂无数据</td></tr>');
                    $("#pagination").empty();
                }
            },
            error: function () {
                $("#rankingBody").html('<tr><td colspan="5" class="text-center text-danger">加载失败</td></tr>');
                $("#pagination").empty();
                // 隐藏加载动画
                $("#tableLoader").hide();
            }
        });
    }

    // 更新分页导航
    function updatePagination(totalPages) {
        if (!totalPages || totalPages <= 0) {
            $("#pagination").empty();
            return;
        }

        totalItems = totalPages * 10; // 更新总条目数
        let pagination = $("#pagination");
        pagination.empty();

        // 添加上一页按钮
        let prevBtn = $('<li class="page-item' + (currentPage === 1 ? ' disabled' : '') + '">')
            .append($('<a class="page-link" href="#">').text('上一页'));
        prevBtn.click(function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                loadRankingData();
            }
        });
        pagination.append(prevBtn);

        // 添加页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                let pageBtn = $('<li class="page-item' + (i === currentPage ? ' active' : '') + '">')
                    .append($('<a class="page-link" href="#">').text(i));
                pageBtn.click(function (e) {
                    e.preventDefault();
                    currentPage = i;
                    loadRankingData();
                });
                pagination.append(pageBtn);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                pagination.append($('<li class="page-item disabled">').append($('<a class="page-link" href="#">').text('...')));
            }
        }

        // 添加下一页按钮
        let nextBtn = $('<li class="page-item' + (currentPage === totalPages ? ' disabled' : '') + '">')
            .append($('<a class="page-link" href="#">').text('下一页'));
        nextBtn.click(function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                loadRankingData();
            }
        });
        pagination.append(nextBtn);
    }

    // 初始化页面
    $(document).ready(function () {
        // 初始化时间筛选按钮
        $(".time-filter .btn").click(function () {
            $(".time-filter .btn").removeClass("active");
            $(this).addClass("active");

            // 更新时间范围
            currentDays = parseInt($(this).data("days"));
            currentPage = 1;
            loadRankingData();
        });

        // 初始化搜索框
        let searchTimeout;
        $("#searchInput").off('input').on("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchQuery = $(this).val().trim();
                currentPage = 1;
                loadRankingData();
            }, 500);
        });

        // 加载初始数据
        loadRankingData();

        // 加载统计概览数据
        $.ajax({
            url: "https://api.kuke.ink/api/playtime/overview",
            type: "GET",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    $("#totalPlayers").text(response.total_players);
                    $("#todayOnline").text(response.today_online);
                    $("#activePlayers").text(response.active_players);

                    // 格式化总在线时长
                    let totalHours = Math.floor(response.total_playtime / 3600);
                    $("#totalPlaytime").text(totalHours + '小时');
                }
            },
            error: function () {
                $(".stats-card .number").text('加载失败');
            }
        });
    });
});