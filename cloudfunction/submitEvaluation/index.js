const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init();

exports.main = async (event, context) => {
  const { orderId, content } = event;

  if (!orderId || !content) {
    return { success: false, error: '参数缺失，无法提交评价' };
  }
 
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

    // 更新订单的评价内容
    const [result] = await connection.execute(
      'UPDATE orders SET comment = ?, status = ? WHERE order_id = ?',
      [content, 2, orderId] // 将订单状态设置为 2 表示已完成状态
    );

    if (result.affectedRows === 0) {
      throw new Error('评价失败，未找到对应订单');
    }

    return { success: true, message: '评价提交成功' };
  } catch (error) {
    console.error('评价提交失败:', error);
    return { success: false, error: '评价提交失败，请稍后重试' };
  } finally {
    if (connection) await connection.end();
  }
};
