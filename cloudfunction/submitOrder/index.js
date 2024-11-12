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

  const { cartItems, totalAmount, tableNumber } = event; // 解构获取 tableNumber
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

    // 插入订单信息到 orders 表
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_price, table_number, created_at, status) VALUES (?, ?, ?, NOW(), ?)',
      [userId, totalAmount, tableNumber, 0]
    );

    // 检查 order_id 是否成功生成
    const orderId = orderResult.insertId;
    if (!orderId) {
      throw new Error('订单 ID 生成失败');
    }
    console.log('订单 ID:', orderId);

    // 插入每个订单项到 order_items 表
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
