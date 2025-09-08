// js/api/users/check-phone.js
const User = require('../../models/User');

app.post('/api/users/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    
    console.log('检查手机号:', phone); // 添加日志
    
    if (!phone) {
      return res.status(400).json({
        exists: false
      });
    }
    
    const user = await User.findOne({ where: { phone } });
    console.log('查询结果:', user); // 添加日志
    
    res.json({
      exists: !!user
    });
    
  } catch (error) {
    console.error('检查手机号失败:', error);
    res.status(500).json({
      exists: false
    });
  }
});