var datepicker = function(id, options, callback) {
    var event = document.getElementById(id),
    MONTHDAYS = [31,28,31,30,31,30,31,31,30,31,30,31], 
    coverId = '',
    containNode = '',
    begin = options.begin||'',
    showTime = begin,
    isLeap=function(date){
        var y=+date.getFullYear();
        return !(y % (y % 100 ? 4 : 400));
    }
    format = function(type, date) { //时间格式化
        var time = new Date(date);
        if (type) {
            return type.replace(/Y+/, time.getFullYear()).replace(/M+/, +time.getMonth() + 1).replace(/D+/, time.getDate()).replace(/h+/, time.getHours()).replace(/m+/, time.getMinutes()).replace(/s+/, time.getSeconds());
        }
    },
    add=function(date, num, type){
        var newDate = new Date(date);
        if(!num){
            return newDate; 
        }
        switch(type){
            case "year":
                newDate.setFullYear(+newDate.getFullYear()+num);
                break;
            case "month":
                newDate.setMonth(+newDate.getMonth()+num);
                break;
            case "day":
                newDate.setDate(+newDate.getDate()+num);
                break;
        }
        return newDate;
    },
    sub=function(date, num, type){
        var newDate = new Date(date);
        if(!num){
            return newDate; 
        }
        switch(type){
            case "year":
                newDate.setFullYear(+newDate.getFullYear()-num);
                break;
            case "month":
                newDate.setMonth(+newDate.getMonth()-num);
                break;
            case "day":
                newDate.setDate(+newDate.getDate()-num);
                break;
        }
        return newDate;
    },
    isSame = function(t1, t2){ //比较时间是否相等
        var d1 = new Date(format('YYYY-MM-DD', t1)).getTime();
        var d2 = new Date(format('YYYY-MM-DD', t2)).getTime();
        return d1===d2;
    },
    template = function(arr){
        var type = options.type,
            html = "<div class='widget_date_title'><div>" + arr[0].month + "</div>";
        if(type===2){
            html += "<div>" + arr[1].month+ "</div>";
        }
        html += "<a class='widget_date_arrow left'><</a><a class='widget_date_arrow right'>></a></div>";
        html += "<div class='widget_date_box'>";
        for(var i=0;i<arr.length;i++){
            html += "<div class='widget_date_box_half'>";
            html += "<div class='inner'><span class='week'>日</span><span class='week'>一</span><span class='week'>二</span><span class='week'>三</span><span class='week'>四</span><span class='week'>五</span><span class='week'>六</span></div>";
            html += "<div class='inner'>";
            for(var j=0,l=arr[i].days.length;j<l;j++){
                html += "<a data-time='"+arr[i].days[j].time+"' class='"+arr[i].days[j].class.join(' ')+"'><span>"+arr[i].days[j].num+"</span></a>";
            }
            html += "</div></div>";
        }
        html += "</div>";
        if(containNode){
            containNode.getElementsByClassName('widget_date')[0].innerHTML = html;
            dayBindEvent();
        }else{
            containNode = document.createElement("div");
            coverId = new Date().getTime();
            coverId = 'cover'+coverId;
            containNode.className = 'hide';
            containNode.innerHTML = "<div id='widget_date' class='widget_date'>"+html+"</div><div id='"+coverId+"' class='widget_date_cover'></div>";
            document.body.appendChild(containNode);
            bindEvent();
        }
    },
    initData = function(){
        var timeArr = [],
            monthlength = options.type||1;

        for(var l=0;l<monthlength;l++){
            var start = new Date(showTime),
                currentDate = add(showTime, l , 'month'),
                oneDays = new Date(currentDate.setDate(1)),
                maxDays = MONTHDAYS[currentDate.getMonth()];
            
            timeArr.push({month:format('YYYY年MM月', currentDate), days:[]});
            if(currentDate.getMonth()===2&&isLeap(currentDate)){
                maxDays = 29;
            }
            oneDays = oneDays.getDay();
            for(var i = 1, j = Math.ceil((maxDays + oneDays) / 7) * 7; i <= j; i++){
                var day = i - oneDays;
                if(day > 0 && day <= maxDays) {
                    timeArr[l].days.push({time:format('YYYY-MM-DD', currentDate.setDate(day)),num:day,class:['day']});
                    var daysL = timeArr[l].days.length-1;
                    var today = new Date();
                    
                    if(isSame(today,currentDate)){
                         timeArr[l].days[daysL].num = '今天';
                    }
                    if(begin&&isSame(begin,currentDate)){
                         timeArr[l].days[daysL].class.push('begin');
                    }
                }else{
                    timeArr[l].days.push({time:'',num:'',class:[]});
                }
            }
        }
        template(timeArr);
    },
    show = function(){
        containNode.className = 'show';
    },
    hide = function(){
        containNode.className = 'hide';
    },
    dayBindEvent = function(){
        var dayNode = containNode.getElementsByClassName("day");
        for(var i in dayNode){
            dayNode[i].onclick = function(){
                var changeTime = this.getAttribute('data-time');
                event.value = changeTime;
                hide();
                if(!isSame(begin, changeTime)){
                    begin = new Date(changeTime);
                    initData();
                    if(callback){
                        callback(changeTime);
                    }
                }
            }
        }
        containNode.getElementsByClassName('left')[0].onclick = function(){
            showTime = sub(showTime, 1 , 'month');
            initData();
        }
        containNode.getElementsByClassName('right')[0].onclick = function(){
            showTime = add(showTime, 1 , 'month');
            initData();
        }
    },
    bindEvent = function(){
        event.onclick = function(){
            show();
        }
        document.getElementById(coverId).onclick = function(){
            hide();
        }
        dayBindEvent();
    };
    if(!id){
        console.error("datepicker没有传入id");
    }else{
        initData();
    }
};

