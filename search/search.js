$(function(){
    /*补全搜索*/
    $("#search-kw").focus(function(){
        SsearchTip($("#search-kw"));
    });
    $(document).on("click", function() {
        $("#search-ul").html("").hide();
       
    })
   $(".close").click(function(){
    $(".search-field,.search_text").val("");
      $(".close").hide()
   })
    /*输入框必须在3个字母三个以上才能提交*/
    $("#search-submit").click(function(){
        if($("#search-kw").val().length < 3){
            $("#search-ul").html("").hide();
             $(".close").hide()
            $(".search-input-error").show();
            return false;
        }
        if($("#search_url").attr("url").length >0){
            location.href = $("#search_url").attr("url");
            return false;
        }else{
            $("#searchForm").submit();
        }
    });
});
var searchKeyNew = "";
window.LastTimestamp = "";
var selectStatus = 0;
/*input propertychange*/
$("#search-kw").bind("keyup",function(){
    if(selectStatus == 0) {
        window.LastTimestamp = Date.parse(new Date());
        $("#search_url").attr("url","");
        var searchKey = $(this).val();
        if (searchKey != searchKeyNew) {
            searchKeyNew = searchKey;
            if (searchKey.length >= 1) {
                var JSONP = document.createElement("script");
                JSONP.type = "text/javascript";
                JSONP.src = "/s?callback=yuncai&s=" + searchKey + "&_time=" + window.LastTimestamp;
                document.getElementsByTagName("head")[0].appendChild(JSONP);
            } else {
                $("#search-ul").html("").hide();
                 $(".close").hide()
            }
        }
        if (searchKey.length >= 3) {
            $(".search-input-error").hide();
        }
    }else{
        selectStatus = 0;
    }
});
function SsearchTip(obj){
    obj.keydown(function(evt){
        if(evt.keyCode == 40){
            //向下键
            SremoveTip(obj,"Down");
            selectStatus = 1;
            return false;
        }else if(evt.keyCode == 38){
            //向上键
            SremoveTip(obj,"Up");
            selectStatus = 1;
            return false;
        }else if(evt.keyCode == 13){
            //回车键
            if($("#search-kw").val().length < 3){
                $("#search-ul").html("").hide();
                $(".search-input-error").show();
                return false;
            }else {
                //提交表单
                form_submit();
            }
        }
    });
}
/** 表单提交动作 **/
function form_submit(){
    return false;
    if($("#search_url").attr("url").length >0){
        location.href = $("#search_url").attr("url");
        return false;
    }else{
        $("#searchForm").submit();
    }
}
function SremoveTip(obj,envetName){
    //ul对象
    var obj_ul = $("ul#search-ul");
    var obj_li = obj_ul.find("li");
    var obj_selectLi = obj_ul.find("li.on");
    var index = -1;
    if(obj_selectLi.length>0){
        index = obj_selectLi.index();
    }
    if(envetName == "Down"){
        index++;
        //高频搜索型号
        if(obj_ul.find("li:eq("+index+")").hasClass('hot')){
            index++;
        }
        if(index == obj_li.length){
            index = 0;
        }
        obj_ul.find("li").removeClass("on");
        obj_ul.find("li:eq("+index+")").addClass("on");
    }else if(envetName == "Up"){
        index--;
        if(obj_ul.find("li:eq("+index+")").hasClass('hot')){
            index--;
        }
        //console.log(obj_li.length);
        if(index == -1){
            index = obj_li.length-1;
        }
        obj_ul.find("li").removeClass("on");
        obj_ul.find("li:eq("+index+")").addClass("on");
    }
    var obj_selectLi_text = obj_ul.find("li.on").text();
    obj.val(obj_selectLi_text);
    if(typeof(obj_ul.find("li.on a").attr('href'))=="string"){
        $("#search_url").attr("url",obj_ul.find("li.on a").attr('href'));
    }else{
        $("#search_url").attr("url","");
    }
}
function yuncai(jsonp,timestamp) {
    if(timestamp == window.LastTimestamp) {
        var results = jsonp;
        var html = "";
        if (results.like.length > 0) {
            $.each(results.like, function (index, value) {
                html += "<li>" + value + "</li>";
            });
            html += '<li class="hot tit">热搜型号</li>';
            $.each(results.hot, function (index, value) {
                html += "<li><a href='" + value.url + "'>" + value.name + "</a></li>";
            });
            $("#search-ul").html(html).show();
            $(".close").show()
            moubind($("#search-ul li"));
        } else {
            $("#search-ul").html("").hide();
             $(".close").hide()
        }
        return false;
    }
}
function moubind(obj){
    obj.bind("mouseover",function(){
        $(this).addClass("on").siblings().removeClass("on");
    });
    obj.bind("click",function(){
        $("#search-kw").val($(this).text());
        //提交表单
        console.log($("#searchForm"));
        $("#searchForm").submit();
    });
}



/*获取查询结果*/
function getdata(keyword){
    var $rate = eval('({"USD":6.3825,"HKD":0.8235,"EUR":6.8401,"GBP":9.7557,"JPY":0.0519})');
    //console.log($rate);
    var url = 'http://octopart.com/api/v3/parts/match?';
    url += '&queries=[{"mpn":"'+keyword+'"}]';
    url += '&apikey=7b0e9d31';
    url += '&callback=?';
    $.getJSON(url, function(response){
        var queries = response['request']['queries'];
        console.log(response);
        $item = response['results'][0]['items'][0];
        //价格区段
        var price_sectors = [];
        //价格数组
        var price_query = [];
        //货币
        var kinds = [];
        $.each($item.offers, function(i, query) {
            //报价价格
            price_query[i] = query.prices;
            //console.log(query);
            $.each(query.prices ,function(key, value){
                kinds[i] = key;
                price_query[i] = value;
                for(j=0;j<value.length;j++){
                    //报价分段
                    price_sectors.push(parseInt(value[j][0]));
                }
            });
            $(".SUKlist").append('<tr><td>'+ query.seller.name +'</td><td>'+ query.sku +'</td><td>'+ query.in_stock_quantity +'</td><td><a href="'+ query.product_url +'">购买</a></td></tr>');

        });
        price_sectors = unique(price_sectors).sort(function(a,b){return a>b?1:-1});
        //生成价格段
        for (var i = 0; i <price_sectors.length; i++) {
            if(i>15){
                continue;
            }
            $(".SUKlist").find('tr:eq(0)').append('<th>'+price_sectors[i]+'</th>');

        };
        //console.log(price_query);
        //显示价格
        for(var m = 0; m < price_query.length ; m++){

            var price_show = '...';
            for(var p=0; p<price_sectors.length ;p++){
                if(p>15){
                    continue;
                }
                var re = sector(price_query[m],price_sectors[p]);
                //console.log(price_query[m]);
                if(re){
                    //汇率换算
                    var kind = kinds[m];
                    //console.log(kind);
                    if(kind == 'CNY'){
                        price_show = parseFloat(re).toFixed(2);
                    }else{
                        price_show = re * $rate[kind];
                        price_show = parseFloat(price_show).toFixed(2);
                    }
                }
                $(".SUKlist").find('tr:eq('+ (m+1) +')').append('<td>' + price_show + '</td>');
            }
        }
    });
}
//去除重复项
function unique(arr) {
    var r = new Array();
    label:for(var i = 0, n = arr.length; i < n; i++) {
        for(var x = 0, y = r.length; x < y; x++) {
            if(r[x] == arr[i]) {
                continue label;
            }
        }
        r[r.length] = arr[i];
    }
    return r;
}
//判断是否存在该区段价格
function sector(arr,sec){
    for(var n0=0; n0<arr.length; n0++){
        if(arr[n0][0] == sec){
            return arr[n0][1];
        }
    }
    return false;
}
/* 关键字检索 */
function getlist(keyword, page){
    var url = "http://octopart.com/api/v3/parts/search";
    url += "?callback=?";

    // NOTE: Use your API key here (https://octopart.com/api/register)
    url += "&apikey=7b0e9d31";
    pagenum = 10;
    var args = {
        q: keyword,
        start: pagenum*page,
        limit: pagenum
    };

    $.getJSON(url, args, function(search_response) {
        console.log(search_response);
        $.each(search_response['results'], function(i, result){
            var part = result['item'];
            // print matched part items
            console.log(part['brand']['name'] + ' - ' + part['mpn']);
            var html = "<tr>";
            html += "<td><a href='"+ result['item']['brand']['homepage_url'] + "'>" + result['item']['brand']['name'] + "</a></td>";
            html += "<td><a href='price.php?kw="+result['item']['mpn']+"'>" + result['item']['mpn'] + "</a></td>";
            html += "<td>" + result['snippet'] + "</td>";
            html += "<td><a href='price.php?kw="+result['item']['mpn']+"'>查看</a></td>";
            html += "</tr>";
            $(".SUKlist").append(html);
            nav_list(page, pagenum, 70,keyword);
        });
    });
}
function nav_list(page, pagenum, count, kw){ //page当前页, pagenum每页包含个数，count共多少结果，kw关键字
    var countpage = Math.floor((count-1)/pagenum);
    var nav = '<nav><ul class="pagination">';
    //前一页
    var predis = page==0 ? "class='disabled'" : "";
    var prepage = page-1;
    nav += '<li ' + predis + '><a href="?kw='+kw+'&page='+ prepage +'" aria-label="Previous"><span aria-hidden="true">上一页</span></a></li>';
    if(countpage < 6){
        for(var i=0; i<=countpage; i++){
            if(i == page){
                var disabled = "class='disabled'";
            }else{
                var disabled = "";
            }
            var j = i+1;
            nav += '<li '+ disabled +'><a href="?kw='+kw+'&page='+ i +'">' + j + '</a></li>';
        }
    }else{
        if(page<4){
            for(var i=0; i<=4; i++){
                if(i == page){
                    var disabled = "class='disabled'";
                }else{
                    var disabled = "";
                }
                var j = i+1;
                nav += '<li '+ disabled +'><a href="?kw='+kw+'&page='+ i +'">' + j + '</a></li>';
            }
            var countpage1 = countpage+1;
            nav += '<li class="disabled"><a href="#" rel="nofollow">...</a></li>';
            nav += '<li><a href="?kw='+kw+'&page='+ countpage +'">' + countpage1 + '</a></li>';
        }else if(countpage-page < 4){
            nav += '<li><a href="?kw='+kw+'">1</a></li>';
            nav += '<li class="disabled"><a href="#" rel="nofollow">...</a></li>';
            for(var i=countpage-4; i<=countpage; i++){
                if(i == page){
                    var disabled = "class='disabled'";
                }else{
                    var disabled = "";
                }
                var j = i+1;
                nav += '<li '+ disabled +'><a href="?kw='+kw+'&page='+ i +'">' + j + '</a></li>';
            }
        }else{
            nav += '<li><a href="?kw='+kw+'">1</a></li>';
            nav += '<li class="disabled"><a href="#" rel="nofollow">...</a></li>';
            for(var i=page-2; i<=page+2; i++){
                if(i == page){
                    var disabled = "class='disabled'";
                }else{
                    var disabled = "";
                }
                var j = i+1;
                nav += '<li '+ disabled +'><a href="?kw='+kw+'&page='+ i +'">' + j + '</a></li>';
            }
            var countpage1 = countpage+1;
            nav += '<li class="disabled"><a href="#" rel="nofollow">...</a></li>';
            nav += '<li><a href="?kw='+kw+'&page='+ countpage +'">' + countpage1 + '</a></li>';
        }
    }
    //下一页
    var nextdis = page==countpage ? "class='disabled'" : "";
    var nextpage = parseInt(page) + 1;
    nav += '<li ' + nextdis + '><a href="?kw='+kw+'&page='+ nextpage +'" aria-label="Next"><span aria-hidden="true">下一页</span></a></li>';
    nav += '</ul></nav><div>共'+count+'个结果</div>';
    $(".nav-list").html(nav);
}