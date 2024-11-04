// cloudfunction/getMenuList/index.js

const mysql = require('mysql2/promise');

exports.main = async (event, context) => {
  // 配置 MySQL 数据库连接信息
  const dbConfig = {
    host: '117.72.15.209',       // 数据库地址
    user: 'chen',    // 数据库用户名
    password: 'Cydia4384!',// 数据库密码
    database: 'restaurant_ordering_system' // 数据库名称
  };

  let connection;
  try {
    // 创建连接
    connection = await mysql.createConnection(dbConfig);

    // 查询 menu_items 表的所有记录
    const [rows] = await connection.query('SELECT * FROM menu_items');
    
    // 返回查询结果
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    return { error: '菜单信息获取失败' };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
