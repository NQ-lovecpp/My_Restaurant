const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

exports.main = async (event, context) => {
  const dbConfig = {
    host: '117.72.15.209',
    user: 'chen',
    password: 'Cydia4384!',
    database: 'restaurant_ordering_system'
  };

  const { status } = event;
  const { OPENID } = cloud.getWXContext();

  let connection;

  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);

    // 获取用户的 user_id
    const [userResult] = await connection.query('SELECT user_id FROM users WHERE openid = ?', [OPENID]);
    if (userResult.length === 0) {
      throw new Error('用户未找到');
    }
    const userId = userResult[0].user_id;

    // 查询订单列表
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE user_id = ? AND (status = ? OR ? = -1) ORDER BY created_at DESC',
      [userId, status, status]
    );

    // 获取每个订单的菜品信息，包括图片链接
    for (let order of orders) {
      const [orderItems] = await connection.query(
        `SELECT oi.menu_item_id, mi.name, mi.image_url 
         FROM order_items AS oi 
         JOIN menu_items AS mi ON oi.menu_item_id = mi.menu_item_id 
         WHERE oi.order_id = ?`, [order.order_id]
      );
      order.items = orderItems; // 添加菜品信息到订单
    }

    return { success: true, data: orders };
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return { success: false, error: '获取订单列表失败' };
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
