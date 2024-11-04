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

  const { cartItems, totalAmount } = event;
  const { OPENID } = cloud.getWXContext();
  
  let connection;

  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);

    // 查询用户ID
    const [userResult] = await connection.query('SELECT user_id FROM users WHERE openid = ?', [OPENID]);
    if (userResult.length === 0) {
      throw new Error('用户未找到');
    }
    const userId = userResult[0].user_id;

    // 开始事务
    await connection.beginTransaction();

    // 插入订单信息
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_price, created_at, status) VALUES (?, ?, NOW(), ?)',
      [userId, totalAmount, 0] // status 初始化为 0
    );
    const orderId = orderResult.insertId;

    // 插入 order_items
    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.menu_item_id, item.quantity]
      );
    }

    // 提交事务
    await connection.commit();

    return { success: true, message: '订单提交成功' };
  } catch (error) {
    console.error('订单提交失败:', error);

    if (connection) {
      await connection.rollback(); // 发生错误时回滚事务
    }

    return { success: false, error: '订单提交失败，请稍后重试' };
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
