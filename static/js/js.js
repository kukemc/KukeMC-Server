/*
 * Author : Peter1303
 * Date: 2020/8/10
 */

// 获取
$.ajax({
    
});

var clipboard = new ClipboardJS('#copy', {
    text: function() {
        return server + ':' + port;
    }
});
clipboard.on('success', function(e) {
    alert('已复制');
});