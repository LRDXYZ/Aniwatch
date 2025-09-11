// js/page/login.js - 使用本地存储的版本
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');

    // 检查是否有保存的登录信息
    checkRememberedLogin();

    // 表单提交事件
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 获取表单数据
        const formData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value.trim(),
            remember: rememberCheckbox.checked
        };

        // 验证表单
        const validation = validateLoginForm(formData);

        if (validation.isValid) {
            // 发送登录请求到后端
            try {
                await performLogin(formData);
            } catch (error) {
                console.error('登录失败:', error);
                showFormErrors({ general: '登录失败，请重试' });
            }
        } else {
            // 显示错误信息
            showFormErrors(validation.errors);
        }
    });

    // 实时验证
    usernameInput.addEventListener('input', CommonUtils.debounce(function () {
        validateField('username', usernameInput.value.trim());
    }, 300));

    passwordInput.addEventListener('input', CommonUtils.debounce(function () {
        validateField('password', passwordInput.value.trim());
    }, 300));

    // 验证登录表单
    function validateLoginForm(formData) {
        const errors = {};

        // 用户名验证
        if (!formData.username) {
            errors.username = '用户名或手机号不能为空';
        } else if (!isValidUsernameOrPhone(formData.username)) {
            errors.username = '请输入有效的用户名或手机号';
        }

        // 密码验证
        if (!formData.password) {
            errors.password = '密码不能为空';
        } else if (!CommonUtils.validatePassword(formData.password)) {
            errors.password = '密码长度至少6位';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }

    // 验证用户名或手机号
    function isValidUsernameOrPhone(value) {
        return CommonUtils.validateUsername(value) || CommonUtils.validatePhone(value);
    }

    // 单个字段验证
    function validateField(fieldName, value) {
        const errorElement = document.getElementById(`${fieldName}-error`);

        if (!errorElement) return;

        let errorMessage = '';

        switch (fieldName) {
            case 'username':
                if (!value) {
                    errorMessage = '用户名或手机号不能为空';
                } else if (!isValidUsernameOrPhone(value)) {
                    errorMessage = '请输入有效的用户名或手机号';
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = '密码不能为空';
                } else if (!CommonUtils.validatePassword(value)) {
                    errorMessage = '密码长度至少6位';
                }
                break;
        }

        // 更新错误显示
        if (errorMessage) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            DOMUtils.addClass(loginForm.querySelector(`#${fieldName}`).parentNode, 'error');
        } else {
            errorElement.style.display = 'none';
            DOMUtils.removeClass(loginForm.querySelector(`#${fieldName}`).parentNode, 'error');
        }
    }

    // 显示表单错误
    function showFormErrors(errors) {
        // 先清除所有错误显示
        clearAllErrors();

        // 显示新的错误
        for (const [field, message] of Object.entries(errors)) {
            const errorElement = document.getElementById(`${field}-error`);
            const inputElement = document.getElementById(field);

            if (errorElement && inputElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block'; // 确保错误消息可见
                DOMUtils.addClass(inputElement.parentNode, 'error');

                // 添加动画效果
                DOMUtils.addClass(inputElement, 'shake');
                setTimeout(() => {
                    DOMUtils.removeClass(inputElement, 'shake');
                }, 500);
            } else if (errorElement) {
                // 处理没有对应输入字段的错误（如general错误）
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }

        // 聚焦到第一个错误字段（排除general错误）
        const focusableFields = Object.keys(errors).filter(field => field !== 'general');
        if (focusableFields.length > 0) {
            const firstErrorField = focusableFields[0];
            const inputElement = document.getElementById(firstErrorField);
            if (inputElement) {
                inputElement.focus();
            }
        }
    }

    // 清除所有错误显示
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.form-text.text-danger'); // 匹配HTML中的错误元素
        errorElements.forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
        });

        const formGroups = document.querySelectorAll('.mb-3'); // 匹配HTML中的表单组
        formGroups.forEach(group => {
            DOMUtils.removeClass(group, 'error');
        });
    }

    // 登录过程（使用本地存储模拟）
    async function performLogin(formData) {
        // 显示加载状态
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '登录中...';
        submitButton.disabled = true;

        try {
            // 从本地存储获取用户数据
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // 查找匹配的用户（通过用户名或手机号）
            const user = users.find(u =>
                (u.username === formData.username || u.phone === formData.username)
                && u.password === formData.password
            );

            if (user) {
                // 登录成功处理
                handleLoginSuccess(user, formData.remember);
            } else {
                // 用户名或密码错误
                showFormErrors({ general: '用户名或密码错误' });
            }

        } catch (error) {
            console.error('登录失败:', error);
            showFormErrors({ general: error.message || '登录失败，请重试' });
        } finally {
            // 恢复按钮状态
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    // 处理登录成功
    function handleLoginSuccess(user, rememberMe) {
        // 保存用户登录状态到本地存储
        const loginData = {
            userId: user.id,
            username: user.username,
            loggedIn: true,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(loginData));

        // 记住我功能（仅保存用户名用于回填，不保存会话或token） 
        if (rememberMe) {
            CommonUtils.setStorage('rememberedUser', { username: user.username });
        } else {
            CommonUtils.removeStorage('rememberedUser');
        }

        // 显示成功消息
        showSuccessMessage('登录成功！正在跳转...');

        // 跳转到首页
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    // 显示成功消息
    function showSuccessMessage(message) {
        // 移除现有成功消息
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        // 创建成功消息元素
        const successElement = DOMUtils.createElement('div', {
            className: 'success-message',
            textContent: message
        });

        loginForm.insertBefore(successElement, loginForm.firstChild);

        // 3秒后自动消失
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }

    // 检查记住的登录信息
    function checkRememberedLogin() {
        const rememberedUser = CommonUtils.getStorage('rememberedUser');
        if (rememberedUser && rememberedUser.username) {
            usernameInput.value = rememberedUser.username;
            rememberCheckbox.checked = true;
        }
    }

    // 初始化页面
    function init() {
        console.log('登录页初始化完成');

        // 添加错误消息容器
        addErrorContainers();
    }

    // 添加错误消息容器
    function addErrorContainers() {
        // 用户名错误容器已存在于HTML中，不需要重复创建
        // 密码错误容器已存在于HTML中，不需要重复创建

        // 检查是否存在general错误容器，如果不存在则创建
        if (!document.getElementById('general-error')) {
            const formElement = document.getElementById('login-form');
            if (formElement) {
                const generalError = DOMUtils.createElement('div', {
                    id: 'general-error',
                    className: 'form-text text-danger text-center'
                });
                // 将general错误插入到记住我复选框和登录按钮之间
                const rememberCheckbox = document.getElementById('remember');
                if (rememberCheckbox && rememberCheckbox.parentNode) {
                    rememberCheckbox.parentNode.parentNode.after(generalError);
                } else {
                    formElement.insertBefore(generalError, formElement.querySelector('.d-grid'));
                }
            }
        }
    }

    // 执行初始化
    init();
});