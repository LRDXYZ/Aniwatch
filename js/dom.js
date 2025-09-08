/**
 * DOM 选择器封装
 */

// 选择单个元素
function getElement(selector, parent = document) {
    return parent.querySelector(selector);
}

// 选择多个元素
function getElements(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

// 通过ID选择元素
function getById(id) {
    return document.getElementById(id);
}

// 通过类名选择元素
function getByClass(className, parent = document) {
    return parent.getElementsByClassName(className);
}

/**
 * DOM 创建和操作封装
 */

// 创建元素并设置属性
function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    // 设置属性
    for (const [key, value] of Object.entries(props)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase().substring(2);
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    }

    // 添加子元素
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
    }

    return element;
}

// 批量创建元素
function createElements(template) {
    const fragment = document.createDocumentFragment();

    template.forEach(item => {
        const element = createElement(item.tag, item.props, item.children);
        fragment.appendChild(element);
    });

    return fragment;
}

// 清空元素内容
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// 显示元素
function showElement(element) {
    element.style.display = '';
}

// 隐藏元素
function hideElement(element) {
    element.style.display = 'none';
}

// 切换元素显示状态
function toggleElement(element) {
    if (element.style.display === 'none') {
        showElement(element);
    } else {
        hideElement(element);
    }
}

/**
 * 事件处理封装
 */

// 事件委托
function delegateEvent(parent, childSelector, eventName, handler) {
    parent.addEventListener(eventName, function (event) {
        let target = event.target;
        while (target && target !== parent) {
            if (target.matches(childSelector)) {
                handler.call(target, event);
                break;
            }
            target = target.parentNode;
        }
    });
}

// 一次性事件绑定
function once(element, eventName, handler) {
    const onceHandler = function (event) {
        handler(event);
        element.removeEventListener(eventName, onceHandler);
    };
    element.addEventListener(eventName, onceHandler);
}

/**
 * 类名操作
 */

// 添加类名
function addClass(element, className) {
    element.classList.add(className);
}

// 移除类名
function removeClass(element, className) {
    element.classList.remove(className);
}

// 切换类名
function toggleClass(element, className) {
    element.classList.toggle(className);
}

// 检查是否包含类名
function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * 样式操作
 */

// 获取样式
function getStyle(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
}

// 设置样式
function setStyle(element, properties) {
    for (const [property, value] of Object.entries(properties)) {
        element.style[property] = value;
    }
}

// 导出所有函数
window.DOMUtils = {
    // 选择器
    getElement,
    getElements,
    getById,
    getByClass,

    // 创建和操作
    createElement,
    createElements,
    clearElement,
    showElement,
    hideElement,
    toggleElement,

    // 事件处理
    delegateEvent,
    once,

    // 类名操作
    addClass,
    removeClass,
    toggleClass,
    hasClass,

    // 样式操作
    getStyle,
    setStyle
};