// js/page/login.js
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    
    // 检查是否有保存的登录信息
    checkRememberedLogin();
    
    // 表单提交事件
    loginForm.addEventListener('submit', async function(e) {
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
                await simulateLogin(formData);
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
    usernameInput.addEventListener('input', CommonUtils.debounce(function() {
        validateField('username', usernameInput.value.trim());
    }, 300));
    
    passwordInput.addEventListener('input', CommonUtils.debounce(function() {
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
                errorElement.style.display = 'block';
                DOMUtils.addClass(inputElement.parentNode, 'error');
                
                // 添加动画效果
                DOMUtils.addClass(inputElement, 'shake');
                setTimeout(() => {
                    DOMUtils.removeClass(inputElement, 'shake');
                }, 500);
            }
        }
        
        // 聚焦到第一个错误字段
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
            document.getElementById(firstErrorField).focus();
        }
    }
    
    // 清除所有错误显示
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
        
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            DOMUtils.removeClass(group, 'error');
        });
    }
    
    // 登录过程（调用后端API，使用基于Cookie的会话）
    async function simulateLogin(formData) {
        // 显示加载状态
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '登录中...';
        submitButton.disabled = true;
        
        try {
            // 发送登录请求到后端（Cookie 会话）
            const response = await CommonUtils.apiFetch('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });
            
            if (response.ok) {
                // 登录成功，服务端通过Set-Cookie建立会话
                handleLoginSuccess(formData.username, formData.remember);
            } else {
                if (response.status === 401) {
                    throw new Error('用户名或密码错误');
                }
                throw new Error('登录失败');
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
    function handleLoginSuccess(username, rememberMe) {
        // 记住我功能（仅保存用户名用于回填，不保存会话或token）
        if (rememberMe) {
            CommonUtils.setStorage('rememberedUser', { username });
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
        const fields = ['username', 'password', 'general'];
        
        fields.forEach(field => {
            const inputElement = document.getElementById(field);
            if (inputElement && !document.getElementById(`${field}-error`)) {
                const errorElement = DOMUtils.createElement('div', {
                    id: `${field}-error`,
                    className: 'error-message'
                });
                
                inputElement.parentNode.appendChild(errorElement);
            }
        });
    }
    
    // 执行初始化
    init();
});