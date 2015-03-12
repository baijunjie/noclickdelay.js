# noclickdelay.js
取消移动设备上click事件的300毫秒延迟

Cancel the click event on a mobile device 300 milliseconds latency

之前在项目中使用过 fastclick.js 来解决click事件的300ms延迟问题，但是遇到label标签和表单元素时出现了bug，同时 fastclick.js 无法兼容某些插件，导致点击后插件不能正常呼出。

开始想在 fastclick.js 上查找问题的原因，并进行修改，后来发现自己真的无能为力。
也向作者反应过这些bug，但很久都没有回应。

于是自己想了一个简单的方法来取消click事件的300ms延迟。
目前运行在项目上没有发现有什么bug，毕竟测试设备和应用的项目有限，如果有使用者发现问题，请及时给予指正，拜谢！

使用方法很简单，在页面任意位置引入即可：
```html
<script src="js/noclickdelay.js"></script>
```

