// api/users/login.js - 登录接口
const User = require('../../models/User');
const bcrypt = require('bcrypt'); // 需要安装 bcrypt: npm install bcrypt

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 查询用户
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: username },
          { phone: username }
        ]
      }
    });
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 检查用户状态
    if (user.status === 'inactive' || user.status === 'banned') {
      return res.status(403).json({ error: '账户已被禁用' });
    }
    
    // 更新最后登录时间
    await User.update(
      { last_login: new Date() },
      { where: { id: user.id } }
    );
    
    // 生成JWT token（示例）
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key', // 在生产环境中应该使用环境变量
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar_url: user.avatar_url,
        status: user.status
      },
      token: token,
      message: '登录成功'
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});