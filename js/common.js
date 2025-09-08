/**
 * 本地存储封装工具函数
 */

// 获取存储数据
function getStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('获取存储数据失败:', error);
        return null;
    }
}

// 设置存储数据
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('设置存储数据失败:', error);
        return false;
    }
}

// 删除存储数据
function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('删除存储数据失败:', error);
        return false;
    }
}

// 清空所有存储
function clearStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('清空存储失败:', error);
        return false;
    }
}

/**
 * 表单验证函数
 */

// 验证手机号格式
function validatePhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
}

// 验证邮箱格式
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// 验证密码强度（至少6位）
function validatePassword(password) {
    return password.length >= 6;
}

// 验证用户名（2-20位字母数字下划线）
function validateUsername(username) {
    const regex = /^[a-zA-Z0-9_]{2,20}$/;
    return regex.test(username);
}

// 表单统一验证
function validateForm(formData, rules) {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];

        if (rule.required && !value) {
            errors[field] = `${field}不能为空`;
            continue;
        }

        if (value) {
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `${field}长度不能少于${rule.minLength}位`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${field}长度不能超过${rule.maxLength}位`;
            } else if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field}格式不正确`;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * 时间格式化函数
 */

// 格式化时间
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 相对时间显示
function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return formatTime(date, 'YYYY-MM-DD');
}

/**
 * 其他工具函数
 */

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 生成随机ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

// 统一带上凭证的fetch封装（用于基于Cookie的会话）
function apiFetch(url, options = {}) {
    const defaultHeaders = options.headers || {};
    const config = {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...defaultHeaders
        }
    };
    return fetch(url, config);
}

// 导出所有函数
window.CommonUtils = {
    // 存储相关
    getStorage,
    setStorage,
    removeStorage,
    clearStorage,

    // 验证相关
    validatePhone,
    validateEmail,
    validatePassword,
    validateUsername,
    validateForm,

    // 时间相关
    formatTime,
    formatRelativeTime,

    // 工具函数
    debounce,
    throttle,
    generateId,
    deepClone,
    apiFetch
};
