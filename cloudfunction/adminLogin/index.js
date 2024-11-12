const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

// 初始化云函数
cloud.init();

exports.main = async (event, context) => {
  const { name, password } = event;

  // MySQL 数据库配置
  const dbConfig = {
    host: '117.72.15.209',       // 数据库地址
    user: 'chen',    // 数据库用户名
    password: 'Cydia4384!',// 数据库密码
    database: 'restaurant_ordering_system' // 数据库名称
  };

  let connection;
  
  try {
    // 建立 MySQL 数据库连接
    connection = await mysql.createConnection(dbConfig);

    // 查询数据库中是否存在该管理员账号
    const [rows] = await connection.execute(
      'SELECT * FROM admin WHERE name = ? AND password = ?', 
      [name, password]
    );

    // 判断是否存在符合条件的记录
    if (rows.length > 0) {
      return { success: true, message: '登录成功' };
    } else {
      return { success: false, message: '账号或密码错误' };
    }
  } catch (error) {
    console.error('数据库查询错误:', error);
    return { success: false, message: '登录失败，请稍后再试' };
  } finally {
    // 关闭数据库连接
    if (connection) {
      await connection.end();
    }
  }
};
