const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

exports.main = async (event, context) => {
  const { orderId, status } = event;
  
  const dbConfig = {
    host: '117.72.15.209',
    user: 'chen',
    password: 'Cydia4384!',
    database: 'restaurant_ordering_system',
    waitForConnections: true,
    connectionLimit: 2, // 推荐使用连接池
    queueLimit: 0
  };

  let connection;

  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);

    // 更新指定订单的状态
    const [result] = await connection.execute(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      throw new Error('订单不存在或状态未修改');
    }

    return { success: true, message: '订单状态更新成功' };
  } catch (error) {
    console.error('订单状态更新失败:', error);
    return { success: false, error: '订单状态更新失败，请稍后再试' };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
