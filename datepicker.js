var datepicker = function(id, option) {
    var event,
    MONTHDAYS = [31,28,31,30,31,30,31,31,30,31,30,31], 
    coverId = '',
    containNode = '',
    showTime = '', //当前日历显示的时间
    curClickTotal = 1, //当前点击次数
    changeBegin, //当前选择的开始时间
    options = {
        begin: '', //默认开始时间
        end: '', //默认结束时间,type==2的时候有用
        disableBefore: '', //禁止此时间之前的时间
        disableAfter: '',  //禁止之后的时间
        type: 1, //日历类型 2为双日历可选择日历范围 默认单日历
        autoClose: true, //选择日期之后是否自动关闭日历框，默认自动关闭
        format: 'YYYY-MM-DD', //时间格式 默认YYYY-MM-DD
        callback: '' //回调函数
    },
    isLeap=function(date){
        var y=+date.getFullYear();
        return !(y % (y % 100 ? 4 : 400));
    },
    format = function(date, type) { //时间格式化
        var time = new Date(date);
        var fm = type||'YYYY-MM-DD';
        return fm.replace(/Y+/, time.getFullYear()).replace(/M+/, +time.getMonth() + 1).replace(/D+/, time.getDate()).replace(/h+/, time.getHours()).replace(/m+/, time.getMinutes()).replace(/s+/, time.getSeconds());
    },
    initTime = function(date){
        return new Date(format(date));
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
    isSame = function(t1, t2){ //比较时间是否相等，返回时间相差天数
        var d1 = +initTime(t1).getTime(),
            d2 = +initTime(t2).getTime();
        return (d2-d1)/(1000*60*60*24);
    },
    template = function(arr){
        var type = options.type,
            html = "<div class='widget_date_title'><div>" + arr[0].month + "</div>";
        if(type==2){
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
    initData = function(changeBeginTime){
        var timeArr = [],
            monthlength = options.type;

        for(var l=0;l<monthlength;l++){
            var start = new Date(showTime),
                begin = changeBeginTime||options.begin,
                end = changeBeginTime?'':options.end,
                currentDate = add(showTime, l , 'month'),
                oneDays = new Date(currentDate.setDate(1)),
                maxDays = MONTHDAYS[currentDate.getMonth()];
            
            timeArr.push({month:format(currentDate, 'YYYY年MM月'), days:[]});
            if(currentDate.getMonth()===2&&isLeap(currentDate)){
                maxDays = 29;
            }
            oneDays = oneDays.getDay();
            for(var i = 1, j = Math.ceil((maxDays + oneDays) / 7) * 7; i <= j; i++){
                var day = i - oneDays;
                if(day > 0 && day <= maxDays) {
                    timeArr[l].days.push({time:format(currentDate.setDate(day)),num:day,class:['day']});
                    var daysL = timeArr[l].days.length-1;
                    var today = new Date();
                    if(isSame(today,currentDate)===0){
                         timeArr[l].days[daysL].num = '今天';
                    }
                    if(begin&&isSame(begin,currentDate)===0){
                        timeArr[l].days[daysL].class.push('begin');
                    }
                    if(options.type==2&&end){
                        if(isSame(end,currentDate)===0){
                            timeArr[l].days[daysL].class.push('end');
                        }
                        if(begin&&isSame(begin,currentDate)>0&&isSame(end,currentDate)<0){
                            timeArr[l].days[daysL].class.push('active');
                        }
                    }
                    if(options.disableBefore&&isSame(currentDate,options.disableBefore)>0){
                        timeArr[l].days[daysL].class.push('disabled');
                    }
                    if(options.disableAfter&&isSame(currentDate,options.disableAfter)<0){
                        timeArr[l].days[daysL].class.push('disabled');
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
                if(this.getAttribute('class').indexOf('disabled')>0){
                    return;
                }
                var changeTime = this.getAttribute('data-time');
                if(options.type==2){
                    if(curClickTotal===1){
                        changeBegin = changeTime;
                        curClickTotal++;
                        initData(changeBegin);
                    }else{
                        if(isSame(changeTime, changeBegin)>0){
                            changeBegin = changeTime;
                            initData(changeBegin);
                            return;
                        }
                        curClickTotal=1;
                        options.autoClose&&hide();
                        if(isSame(options.begin, changeBegin)||isSame(options.end, changeTime)){
                            event.value = format(new Date(changeBegin), options.format)+' - '+format(new Date(changeTime), options.format);
                            options.begin = initTime(changeBegin);
                            options.end = initTime(changeTime)
                            initData();
                            changeBegin = '';
                        }
                        options.callback&&options.callback({begin:options.begin, end:options.end});
                    }
                }else{
                    options.autoClose&&hide();
                    if(isSame(options.begin, changeTime)){
                        event.value = format(changeTime, options.format);
                        options.begin = new Date(changeTime);
                        initData();
                    }
                    options.callback&&options.callback(initTime(changeTime));
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
        event = document.getElementById(id);

        for(var i in option){
            options[i] = option[i];
        }
        showTime = options.begin;
        initData();
    }
};

