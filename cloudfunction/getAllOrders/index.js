  const cloud = require('wx-server-sdk');
  const mysql = require('mysql2/promise');
  
  cloud.init();
  
  exports.main = async (event, context) => {
    const { status } = event;
    
    const dbConfig = {
      host: '117.72.15.209',
      user: 'chen',
      password: 'Cydia4384!',
      database: 'restaurant_ordering_system',
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0
    };
  
    let connection;
  
    try {
      connection = await mysql.createConnection(dbConfig);
  
      // 查询特定状态的订单
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE status = ?',
        [status]
      );
  
      // 查询每个订单的详细菜品信息
      for (const order of orders) {
        const [items] = await connection.execute(
          `SELECT oi.menu_item_id, mi.name, oi.quantity, mi.image_url 
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.menu_item_id
           WHERE oi.order_id = ?`, [order.order_id]
        );
        order.items = items;
      }
  
      return { success: true, data: orders };
    } catch (error) {
      console.error('获取订单失败:', error);
      return { success: false, error: '获取订单失败，请稍后再试' };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  };
  