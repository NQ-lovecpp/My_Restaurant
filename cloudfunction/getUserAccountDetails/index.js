const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const dbConfig = {
    host: '117.72.15.209',       // 数据库地址
    user: 'chen',    // 数据库用户名
    password: 'Cydia4384!',// 数据库密码
    database: 'restaurant_ordering_system' // 数据库名称
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 获取用户信息
    const [users] = await connection.query('SELECT * FROM users WHERE openid = ?', [OPENID]);
    if (users.length === 0) return { error: '用户未注册' };
    const userInfo = users[0];

    // 获取用户的历史订单
    const [orders] = await connection.query('SELECT * FROM orders WHERE user_id = ?', [userInfo.id]);
    const orderItems = await Promise.all(orders.map(async (order) => {
      const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return { ...order, items };
    }));

    return { userInfo, orders: orderItems };
  } catch (error) {
    console.error('获取用户信息和订单失败:', error);
    return { error: '获取用户信息和订单失败' };
  } finally {
    if (connection) connection.end();
  }
};
