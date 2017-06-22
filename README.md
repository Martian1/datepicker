# datepicker
日历插件<br><br>
##参数说明<br>
id: 必须，绑定日历的input元素<br><br>
###option 参数,选填<br>
　begin 默认开始时间<br>
　end 默认结束时间,type==2的时候有用<br>
　disableBefore 禁止此时间之前的时间<br>
　disableAfter 禁止之后的时间<br>
　type 日历类型 2为双日历可选择日历范围 默认单日历<br>
　autoClose 选择日期之后是否自动关闭日历框，默认自动关闭<br>
　format 时间格式 默认YYYY-MM-DD<br>
　callback 回调函数<br>
<br>
```javascript
datepicker('datepicker2',{
    begin: new Date(),
    end:'2017-7-2',
    disableBefore: '2017-6-22',
    disableAfter: '2017-7-6',
    type: 2,
    autoClose: true,
    format: 'YYYY:MM:DD'
});
