/**
 * @file datepicker.js
 * @author zhaoqing07
 *
 * @param {string} id 必须，绑定日历的input元素
 * @param {Object=} option 参数说明
 * @param {string=} option.type 日历类型 2为双日历可选择日历范围 默认单日历
 * @param {string | dateObject=} option.begin 初始开始时间,默认今天
 * @param {string | dateObject=} option.end 初始结束时间,type==2的时候有用
 * @param {string | dateObject=} option.disableBefore 禁止此时间之前的时间
 * @param {string | dateObject=} option.disableAfter 禁止之后的时间
 * @param {boolean=} option.autoClose 选择日期之后是否自动关闭日历框，默认自动关闭
 * @param {string=} option.format 时间格式 默认YYYY-MM-DD
 * @param {Function=} option.callback 回调函数
 **/

(function (global) {
    function Datepicker(id, option) {
        if (!id) {
            throw new Error('dom element id can not be empty');
        }
        this._initData(id, option);
    }

    /**
     * 初始化数据
     *
     * @param {string} id 绑定日历的input元素id
     * @param {Object} option 构造函数参数集
     */
    Datepicker.prototype._initData = function (id, option) {
        this.$event = document.getElementById(id);
        this.MONTHDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.coverId = '';
        this.containNode = '';
        // 当前日历显示的时间
        this.showTime = '';
        // 当前点击次数
        this.curClickTotal = 1;
        // 当前选择的开始时间
        this.changeBegin;
        this.options = {
            begin: new Date(),
            end: '',
            disableBefore: '',
            disableAfter: '',
            type: 1,
            autoClose: true,
            format: 'YYYY-MM-DD',
            callback: null
        };

        for (var i in option) {
            this.options[i] = option[i];
        }
        this.showTime = this.options.begin;
        this._initTemplateData();
        this._bindEvent();
    };

    /**
     * 生成html结构并绑定到页面上
     *
     * @param {string | dateObject=} changeBeginTime 开始时间
     */
    Datepicker.prototype._initTemplateData = function (changeBeginTime) {
        var timeArr = [];
        var monthlength = this.options.type;

        for (var l = 0; l < monthlength; l++) {
            var begin = changeBeginTime || this.options.begin;
            var end = changeBeginTime ? '' : this.options.end;
            var currentDate = this._add(this.showTime, l, 'month');
            var oneDays = new Date(currentDate.setDate(1));
            var maxDays = this.MONTHDAYS[currentDate.getMonth()];
            timeArr.push({month: this._format(currentDate, 'YYYY年MM月'), days: []});
            if (currentDate.getMonth() === 2 && this._isLeap(currentDate)) {
                maxDays = 29;
            }
            oneDays = oneDays.getDay();
            for (var i = 1, j = Math.ceil((maxDays + oneDays) / 7) * 7; i <= j; i++) {
                var day = i - oneDays;
                if (day < 1 || day > maxDays) {
                    timeArr[l].days.push({'time': '', 'num': '', 'class': []});
                    continue;
                }
                var time = this._format(currentDate.setDate(day));
                timeArr[l].days.push({'time': time, 'num': day, 'class': ['day']});
                var daysL = timeArr[l].days.length - 1;
                var today = new Date();
                if (this._isSame(today, currentDate) === 0) {
                    timeArr[l].days[daysL].num = '今天';
                }
                if (begin && this._isSame(begin, currentDate) === 0) {
                    timeArr[l].days[daysL].class.push('begin');
                }
                if (this.options.type === 2 && end) {
                    if (this._isSame(end, currentDate) === 0) {
                        timeArr[l].days[daysL].class.push('end');
                    }
                    if (begin && this._isSame(begin, currentDate) > 0 && this._isSame(end, currentDate) < 0) {
                        timeArr[l].days[daysL].class.push('active');
                    }
                }
                if (this.options.disableBefore && this._isSame(currentDate, this.options.disableBefore) > 0) {
                    timeArr[l].days[daysL].class.push('disabled');
                }
                if (this.options.disableAfter && this._isSame(currentDate, this.options.disableAfter) < 0) {
                    timeArr[l].days[daysL].class.push('disabled');
                }
            }
        }
        var type = this.options.type;
        var html = '<div class="widget-date-title"><div>' + timeArr[0].month + '</div>';
        if (type === 2) {
            html += '<div>' + timeArr[1].month + '</div>';
        }
        html += '<a class="widget-date-arrow left">&lt;</a><a class="widget-date-arrow right">&gt;</a></div>';
        html += '<div class="widget-date-box">';
        for (var i = 0, len = timeArr.length; i < len; i++) {
            html += '<div class="widget-date-box-half">'
                        + '<div class="inner">'
                            + '<span class="week">日</span>'
                            + '<span class="week">一</span>'
                            + '<span class="week">二</span>'
                            + '<span class="week">三</span>'
                            + '<span class="week">四</span>'
                            + '<span class="week">五</span>'
                            + '<span class="week">六</span>'
                        + '</div>'
                    + '<div class="inner">';
            var curArr = timeArr[i];
            for (var j = 0, l = curArr.days.length; j < l; j++) {
                var curDay = curArr.days[j];
                html += '<a data-time="'
                        + curDay.time
                        + '" class="'
                        + curDay.class.join(' ')
                        + '">'
                        + curDay.num
                        + '</a>';
            }
            html += '</div></div>';
        }
        html += '</div>';
        if (this.containNode) {
            this.containNode.getElementsByClassName('widget-date')[0].innerHTML = html;
            return;
        }
        this.containNode = document.createElement('div');
        this.coverId = new Date().getTime();
        this.coverId = 'cover' + this.coverId;
        this.containNode.className = 'hide';
        this.containNode.innerHTML = '<div class="widget-date">' + html + '</div>'
                                   + '<div id="' + this.coverId + '" class="widget-date-cover"></div>';
        document.body.appendChild(this.containNode);
    };

    /**
     * 绑定事件
     */
    Datepicker.prototype._bindEvent = function () {
        var that = this;
        this.containNode.onclick = function (eve) {
            var e = eve || window.event;
            var target = e.target || e.srcElement;
            var classList = target.classList;
            if (classList.contains('left')) {
                that.showTime = that._add(that.showTime, -1, 'month');
                that._initTemplateData();
            }
            if (classList.contains('right')) {
                that.showTime = that._add(that.showTime, 1, 'month');
                that._initTemplateData();
            }
            if (classList.contains('day') && !classList.contains('disabled')) {
                var changeTime = target.getAttribute('data-time');
                // 双日历类型
                if (that.options.type === 2) {
                    // 双日历选择时间范围，选择开始时间不能关闭日历框
                    if (that.curClickTotal === 1) {
                        that.changeBegin = changeTime;
                        that.curClickTotal++;
                        that._initTemplateData(that.changeBegin);
                        return;
                    }
                    // 选择结束时间不能小于已选择的开始时间
                    if (that._isSame(changeTime, that.changeBegin) > 0) {
                        that.changeBegin = changeTime;
                        that._initTemplateData(that.changeBegin);
                        return;
                    }
                    that.curClickTotal = 1;
                    that.options.autoClose && that._hide();
                    var isChangeBeginSame = that._isSame(that.options.begin, that.changeBegin);
                    var isChangeEndSame = that._isSame(that.options.end, changeTime);
                    if (isChangeBeginSame || isChangeEndSame) {
                        that.$event.value = that._format(new Date(that.changeBegin), that.options.format)
                                        + ' - '
                                        + that._format(new Date(changeTime), that.options.format);
                        that.options.begin = that._initTime(that.changeBegin);
                        that.options.end = that._initTime(changeTime);
                        that._initTemplateData();
                        that.changeBegin = '';
                    }
                    if (that.options.callback) {
                        that.options.callback({begin: that.options.begin, end: that.options.end});
                    }
                    return;
                }
                that.options.autoClose && that._hide();
                if (that._isSame(that.options.begin, changeTime)) {
                    that.$event.value = that._format(changeTime, that.options.format);
                    that.options.begin = new Date(changeTime);
                    that._initTemplateData();
                }
                that.options.callback && that.options.callback(that._initTime(changeTime));
            }
        };
        that.$event.onclick = function () {
            that._show();
        };
        document.getElementById(this.coverId).onclick = function () {
            that._hide();
        };
    };

    /**
     * 判断日期是否是闰年
     *
     * @param {Object} date 日期对象
     * @return {boolean} 是否是闰年
     */
    Datepicker.prototype._isLeap = function (date) {
        if (!date) {
            throw new Error('date object can not be empty');
        }
        var y = +date.getFullYear();
        return !(y % (y % 100 ? 4 : 400));
    };

    /**
     * 格式化日期
     *
     * @param {string | Object=} date 日期对象
     * @param {string=} type 日期格式
     * @return {string} 格式化的日期
     */
    Datepicker.prototype._format = function (date, type) {
        var time = date ? new Date(date) : new Date();
        var fm = type || 'YYYY-MM-DD';
        var fmTime = fm.replace(/Y+/, time.getFullYear());
        fmTime = fmTime.replace(/M+/, +time.getMonth() + 1);
        fmTime = fmTime.replace(/D+/, time.getDate());
        return fmTime;
    };

    /**
     * 初始化时间，返回时间对象
     *
     * @param {string | Object=} date 日期对象
     * @return {Object} 初始化的日期对象
     */
    Datepicker.prototype._initTime = function (date) {
        return new Date(this._format(date));
    };

    /**
     * 日期加法，返回增加后的日期
     *
     * @param {string | Object} date 日期对象
     * @param {number} num 增加天数，可为负数
     * @param {string} type 类型 year：年，month：月，day：日
     * @return {Object} 返回增加后的日期
     */
    Datepicker.prototype._add = function (date, num, type) {
        var newDate = new Date(date);
        if (!num) {
            return newDate;
        }
        switch (type) {
            case 'year':
                newDate.setFullYear(+newDate.getFullYear() + num);
                break;
            case 'month':
                newDate.setMonth(+newDate.getMonth() + num);
                break;
            case 'day':
                newDate.setDate(+newDate.getDate() + num);
                break;
        }
        return newDate;
    };

    /**
     * 比较时间是否相等，返回时间相差天数
     *
     * @param {string | Object} t1 开始时间
     * @param {string | Object} t2 结束时间
     * @return {number} 比较时间是否相等，返回时间相差天数
     */
    Datepicker.prototype._isSame = function (t1, t2) {
        var d1 = +this._initTime(t1).getTime();
        var d2 = +this._initTime(t2).getTime();
        return (d2 - d1) / (1000 * 60 * 60 * 24);
    };

    /**
     * 显示日历框
     */
    Datepicker.prototype._show = function () {
        this.containNode.classList.remove('hide');
    };

    /**
     * 隐藏日历框
     */
    Datepicker.prototype._hide = function () {
        this.containNode.classList.add('hide');
    };

    if (typeof require === 'function'
        && typeof module === 'object'
        && typeof exports === 'object') {
        module.exports = Datepicker;
    }
    /* AMD */
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return Datepicker;
        });
    }
    /* Global */
    else {
        global.Datepicker = global.Datepicker || Datepicker;
    }
})(window);
