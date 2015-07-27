/**
 * @brief noclickdelay v1.8 取消移动设备上click事件的300毫秒延迟
 * @author 白俊杰 625603381@qq.com 2015/3/27
 * https://github.com/baijunjie/noclickdelay.js
 */
(function() {

var isMobile = !!navigator.userAgent.match(/mobile/i),
	isWinPhone = !!navigator.userAgent.match(/Windows Phone/i),
	isApple = !!navigator.userAgent.match(/(iPad|iPod|iPhone)/i) && !isWinPhone,
	isAndroid = !!navigator.userAgent.match(/android/i) && !isWinPhone,
	supportPointer = !!window.navigator.pointerEnabled || !!window.navigator.msPointerEnabled;

if (supportPointer) { // 支持pointer的设备可用样式来取消click事件的300毫秒延迟
	document.body.style.msTouchAction = "none";
	document.body.style.touchAction = "none";
} else if (isMobile) {
	var touchX, touchY,
		labelControl = null, // label绑定元素
		focusElement = null, // 当前焦点元素
		trackingClickStart,
		timeout = 700,
		cancelClick; // 是否取消点击行为

	document.addEventListener("touchstart", function(e) {
		var touch = e.changedTouches[0];
		touchX = touch.clientX;
		touchY = touch.clientY;
		trackingClickStart = e.timeStamp;
		cancelClick = false;
	}, false);

	document.addEventListener("touchmove", function(e) {
		var touch = e.changedTouches[0];
		// 水平或垂直方向移动超过15px测判定为取消（根据chrome浏览器默认的判断取消点击的移动量）
		if (Math.abs(touch.clientX - touchX) > 15
		|| Math.abs(touch.clientY - touchY) > 15) {
			cancelClick = true;
		}
	}, false);

	document.addEventListener("touchend", function(e) {
		var touch = e.changedTouches[0];

		if (e.timeStamp - trackingClickStart > timeout) {
			cancelClick = true;
		}

		if (cancelClick) {
			cancelClick = false;
			return;
		}

		var is_form = isForm(e.target),
			is_text = isText(e.target),
			is_select = isSelect(e.target),
			is_checkbox = isCheckbox(e.target),
			is_disabled = isDisabled(e.target);


		if (is_form) { // 如果是表单元素，则让其获取焦点
			focusElement = e.target;
			focusElement.focus();
			if (isAndroid && is_select) { // 在Android设备上，如果是select，则单独转发一个mousedown事件，用于激活选择列表
				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent("mousedown", true, true);
				evt.forwardedTouchEvent = true;
				e.target.dispatchEvent(evt);
			}
		} else { // 如果不是表单元素，则判断事件源节点是否处于label标签中
			if (focusElement) {
				focusElement.blur();
				focusElement = null;
			}
			labelControl = null;
			var node = e.target;
			while (node) {
				if (node.tagName == "BODY") break;
				else if (node.tagName == "LABEL") {
					// 当非表单元素触发的click事件冒泡到label层时，label都会使自己绑定的表单元素单独再触发一次click事件
					// 这里需要获取label的绑定表单元素，以便之后在click事件监听中不阻止该元素的事件冒泡
					if (node.control) labelControl = node.control;
					break;
				}
				node = node.parentNode;
			}
		}

		if ((!is_disabled && !is_text)
		// 如果该元素不是禁用状态，且不是文本输入框，才派发click事件
		// 因为不是禁用状态的文本输入框再之前已经被设置为焦点，同时激活了键盘，使文本框自身产生了位移
		// 此时再派发click事件将会使文本输入框失去焦点
		|| (is_disabled && !is_checkbox)) {
		// 或者如果是禁用状态，但不是checkbox或者radio，才派发click事件
		// 因为禁用状态下的checkbox和radio会被这里派发的click事件激活
			var evt = document.createEvent("MouseEvents");
			evt.initMouseEvent("click", true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
			evt.forwardedTouchEvent = true;
			e.target.dispatchEvent(evt);
		}

		if (isApple) { // IOS设备消除touchend后300ms触发的click事件
			// 如果不是可用文本域才阻止浏览器的默认行为
			// 因为文本弹出编辑菜单和指定光标到某一文本段落的动作需要浏览器默认行为的支持
			if (is_disabled || !is_text) e.preventDefault();
		} else if (isAndroid) { // Android设备消除touchend后150ms触发的mousedown事件
			// 如果不是文本域才阻止浏览器的默认行为
			// 即使文本域不可用，也不可以阻止浏览器的默认行为，因为这样会使不可用的文本域呼出虚拟键盘
			if (!is_text) e.preventDefault();
		}
	}, false);

	document.addEventListener("click", function(e) {
		if (e.target == labelControl) { // 如果是label绑定的表单元素，则设置为焦点元素
			focusElement = e.target;
			focusElement.focus();
			labelControl = null;
		} else if (!e.forwardedTouchEvent) { // 其余所有非touch触发的click事件全部阻止
			focusElement && focusElement.focus(); // 取消焦点的行为无法被阻断，因此需要再为焦点元素设置一次焦点
			e.preventDefault();
			e.stopImmediatePropagation();
			return false;
		}
	}, true);

	if (isAndroid) {
		// Android设备上，文本域的touchend事件中没有阻止浏览器的默认行为
		// 因此在这里来阻止之后的 click 事件
		document.addEventListener("mousedown", function(e) {
			// 在mousedown事件中消除touchend后300ms触发的click事件，防止点透
			e.stopImmediatePropagation();
		}, true); // 事件必须注册在捕获阶段
	}

	function isForm(target) {
		switch (target.tagName) {
			case 'BUTTON':
			case 'TEXTAREA':
			case 'SELECT':
			case 'INPUT':
				return true;
			default:
				return false;
		}
	}
	function isSelect(target) {
		return target.tagName == 'SELECT';
	}
	function isText(target) {
		switch (target.tagName) {
			case 'TEXTAREA':
				return true;
			case 'INPUT':
				switch (target.type) {
					case 'text':
					case 'search':
					case 'password':
					case 'tel':
					case 'email':
					case 'url':
						return true;
				}
				return false;
			default:
				return false;
		}
	}
	function isCheckbox(target) {
		switch (target.tagName) {
			case 'INPUT':
				switch (target.type) {
					case 'checkbox':
					case 'radio':
						return true;
				}
				return false;
			default:
				return false;
		}
	}
	function isDisabled(target) {
		return target.hasAttribute("disabled") || target.hasAttribute("readonly");
	}
}

})();