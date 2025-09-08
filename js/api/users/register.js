// api/users/register.js - 注册接口
const User = require('../../models/User');
const bcrypt = require('bcrypt');

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, phone, password, email } = req.body; // 注意这里改为 password 而不是 password_hash
    
    // 输入验证
    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、手机号和密码不能为空'
      });
    }
    
    // 验证用户名格式
    const usernameRegex = /^[a-zA-Z0-9_]{2,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: '用户名必须是2-20位字母、数字或下划线'
      });
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: '请输入有效的手机号'
      });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: '用户名已被使用'
      });
    }
    
    // 检查手机号是否已存在
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: '手机号已被注册'
      });
    }
    
    // 哈希密码
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // 创建新用户
    const newUser = await User.create({
      username,
      phone,
      password_hash,
      email: email || null,
      avatar_url: null,
      created_at: new Date(),
      last_login: null,
      status: 'active'
    });
    
    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        created_at: newUser.created_at,
        status: newUser.status
      }
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});