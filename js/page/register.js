// js/page/register.js - 注册功能完善版
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('reg-username');
    const phoneInput = document.getElementById('reg-phone');
    const passwordInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm');
    
    // 表单提交事件
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = {
            username: usernameInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value.trim(),
            confirm: confirmInput.value.trim()
        };
        
        // 验证表单
        const validation = validateRegisterForm(formData);
        
        if (validation.isValid) {
            // 注册过程（调用后端API，使用基于Cookie的会话）
            try {
                await simulateRegistration(formData);
            } catch (error) {
                console.error('注册失败:', error);
                showFormErrors({ general: error.message || '注册失败，请重试' });
            }
        } else {
            // 显示错误信息
            showFormErrors(validation.errors);
        }
    });
    
    // 实时验证
    usernameInput.addEventListener('input', CommonUtils.debounce(function() {
        validateField('reg-username', usernameInput.value.trim(), 'username');
    }, 300));
    
    phoneInput.addEventListener('input', CommonUtils.debounce(function() {
        validateField('reg-phone', phoneInput.value.trim(), 'phone');
    }, 300));
    
    passwordInput.addEventListener('input', CommonUtils.debounce(function() {
        validateField('reg-password', passwordInput.value.trim(), 'password');
        validatePasswordConfirmation();
    }, 300));
    
    confirmInput.addEventListener('input', CommonUtils.debounce(function() {
        validateField('reg-confirm', confirmInput.value.trim(), 'confirm');
        validatePasswordConfirmation();
    }, 300));
    
    // 验证注册表单
    function validateRegisterForm(formData) {
        const errors = {};
        
        // 用户名验证
        if (!formData.username) {
            errors.username = '用户名不能为空';
        } else if (!CommonUtils.validateUsername(formData.username)) {
            errors.username = '用户名必须是2-20位字母、数字或下划线';
        } else if (isUsernameTaken(formData.username)) {
            errors.username = '用户名已被使用';
        }
        
        // 手机号验证
        if (!formData.phone) {
            errors.phone = '手机号不能为空';
        } else if (!CommonUtils.validatePhone(formData.phone)) {
            errors.phone = '请输入有效的手机号';
        } else if (isPhoneTaken(formData.phone)) {
            errors.phone = '手机号已被注册';
        }
        
        // 密码验证
        if (!formData.password) {
            errors.password = '密码不能为空';
        } else if (!CommonUtils.validatePassword(formData.password)) {
            errors.password = '密码长度至少6位';
        }
        
        // 确认密码验证
        if (!formData.confirm) {
            errors.confirm = '请确认密码';
        } else if (formData.password !== formData.confirm) {
            errors.confirm = '两次输入的密码不一致';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
    
    // 检查用户名是否已被使用
    async function isUsernameTaken(username) {
        try {
            const response = await fetch('/api/users/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            });
            
            const result = await response.json();
            return result.exists;
        } catch (error) {
            console.error('检查用户名失败:', error);
            return false;
        }
    }
    
    // 检查手机号是否已被注册
    async function isPhoneTaken(phone) {
        try {
            const response = await fetch('/api/users/check-phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: phone })
            });
            
            const result = await response.json();
            return result.exists;
        } catch (error) {
            console.error('检查手机号失败:', error);
            return false;
        }
    }
    
    // 单个字段验证
    function validateField(fieldId, value, fieldType) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!errorElement) return;
        
        let errorMessage = '';
        
        switch (fieldType) {
            case 'username':
                if (!value) {
                    errorMessage = '用户名不能为空';
                } else if (!CommonUtils.validateUsername(value)) {
                    errorMessage = '用户名必须是2-20位字母、数字或下划线';
                } else if (isUsernameTaken(value)) {
                    errorMessage = '用户名已被使用';
                }
                break;
                
            case 'phone':
                if (!value) {
                    errorMessage = '手机号不能为空';
                } else if (!CommonUtils.validatePhone(value)) {
                    errorMessage = '请输入有效的手机号';
                } else if (isPhoneTaken(value)) {
                    errorMessage = '手机号已被注册';
                }
                break;
                
            case 'password':
                if (!value) {
                    errorMessage = '密码不能为空';
                } else if (!CommonUtils.validatePassword(value)) {
                    errorMessage = '密码长度至少6位';
                }
                break;
                
            case 'confirm':
                if (!value) {
                    errorMessage = '请确认密码';
                } else if (value !== passwordInput.value.trim()) {
                    errorMessage = '两次输入的密码不一致';
                }
                break;
        }
        
        // 更新错误显示
        if (errorMessage) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            DOMUtils.addClass(document.getElementById(fieldId).parentNode, 'error');
        } else {
            errorElement.style.display = 'none';
            DOMUtils.removeClass(document.getElementById(fieldId).parentNode, 'error');
        }
    }
    
    // 验证密码确认
    function validatePasswordConfirmation() {
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();
        
        if (password && confirm && password !== confirm) {
            const errorElement = document.getElementById('reg-confirm-error');
            if (errorElement) {
                errorElement.textContent = '两次输入的密码不一致';
                errorElement.style.display = 'block';
                DOMUtils.addClass(confirmInput.parentNode, 'error');
            }
        }
    }
    
    // 显示表单错误
    function showFormErrors(errors) {
        // 先清除所有错误显示
        clearAllErrors();
        
        // 显示新的错误
        for (const [field, message] of Object.entries(errors)) {
            let fieldId, errorElement;
            
            switch (field) {
                case 'username':
                    fieldId = 'reg-username';
                    break;
                case 'phone':
                    fieldId = 'reg-phone';
                    break;
                case 'password':
                    fieldId = 'reg-password';
                    break;
                case 'confirm':
                    fieldId = 'reg-confirm';
                    break;
                default:
                    fieldId = field;
            }
            
            errorElement = document.getElementById(`${fieldId}-error`);
            const inputElement = document.getElementById(fieldId);
            
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
            let fieldId;
            switch (firstErrorField) {
                case 'username': fieldId = 'reg-username'; break;
                case 'phone': fieldId = 'reg-phone'; break;
                case 'password': fieldId = 'reg-password'; break;
                case 'confirm': fieldId = 'reg-confirm'; break;
                default: fieldId = firstErrorField;
            }
            document.getElementById(fieldId).focus();
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
    
    // 注册过程（调用后端API，使用基于Cookie的会话）
    async function simulateRegistration(formData) {
        // 显示加载状态
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '注册中...';
        submitButton.disabled = true;
        
        try {
            // 发送注册请求到后端（明文密码传输，需HTTPS；服务端负责hash）
            const response = await CommonUtils.apiFetch('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({
                    username: formData.username,
                    phone: formData.phone,
                    password: formData.password
                })
            });
            
            if (response.ok) {
                // 可选：部分系统注册即登录（服务端Set-Cookie）
                handleRegisterSuccess();
            } else {
                if (response.status === 409) {
                    throw new Error('用户名或手机号已存在');
                }
                throw new Error('注册失败');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            showFormErrors({ general: error.message || '注册失败，请重试' });
        } finally {
            // 恢复按钮状态
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    // 注册成功后的处理
    function handleRegisterSuccess() {
        // 显示成功消息
        showSuccessMessage('注册成功！正在跳转到登录页...');

        // 跳转到登录页（如服务端已自动登录，可跳首页）
        setTimeout(() => {
            window.location.href = 'login.html';
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
        
        registerForm.insertBefore(successElement, registerForm.firstChild);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 3000);
    }
    
    // 初始化页面
    function init() {
        console.log('注册页初始化完成');
        
        // 添加错误消息容器
        addErrorContainers();
    }
    
    // 添加错误消息容器
    function addErrorContainers() {
        const fields = ['reg-username', 'reg-phone', 'reg-password', 'reg-confirm'];
        
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