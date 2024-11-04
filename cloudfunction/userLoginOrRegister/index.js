const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

const dbConfig = {
  host: '117.72.15.209',
  user: 'chen',
  password: 'Cydia4384!',
  database: 'restaurant_ordering_system',
  waitForConnections: true,
  connectionLimit: 2, // 推荐使用连接池
  queueLimit: 0
};

let pool;

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool.getConnection();
}


exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  console.log('接收到的用户信息:', event.userInfo); // 打印前端发送的用户信息
  const { nickName, avatarUrl } = event.userInfo;

  console.log('接收到的 OPENID:', OPENID);

  let connection;
  try {
    connection = await getConnection();

    const [users] = await connection.query('SELECT * FROM users WHERE openid = ?', [OPENID]);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('查询到的用户信息:', user);
      return {
        isNewUser: false,
        userInfo: {
          id: user.id,
          openid: user.openid,
          nickName: user.nickName,
          avatarUrl: user.avatarUrl,
          balance: user.balance,
          created_at: user.created_at // 确保返回此字段
        }
      };
    } else {
      const [result] = await connection.query(
        'INSERT INTO users (openid, nickName, avatarUrl, balance) VALUES (?, ?, ?, ?)',
        [OPENID, nickName, avatarUrl, 0]
      );

      const newUserId = result.insertId;
      const newUser = {
        id: newUserId,
        openid: OPENID,
        nickName,
        avatarUrl,
        balance: 0
      };

      console.log('新用户注册成功:', newUser);
      return {
        isNewUser: true,
        userInfo: newUser
      };
    }
  } catch (error) {
    console.error('数据库操作失败:', error);
    return { error: `用户注册或登录失败: ${error.message}` };
  } finally {
    if (connection) {
      await connection.release();
    }
  }
};

