// cloudfunction/getMenuDetail/index.js
const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  const dbConfig = {
    host: '117.72.15.209',       // 数据库地址
    user: 'chen',    // 数据库用户名
    password: 'Cydia4384!',// 数据库密码
    database: 'restaurant_ordering_system' // 数据库名称
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 查询指定 id 的菜品详情
    const [rows] = await connection.query('SELECT * FROM menu_items WHERE id = ?', [event.id]);
    
    if (rows.length > 0) {
      return rows[0]; // 返回菜品详情
    } else {
      return { error: '菜品未找到' };
    }
  } catch (error) {
    console.error('数据库查询错误:', error);
    return { error: '菜品详情获取失败' };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
