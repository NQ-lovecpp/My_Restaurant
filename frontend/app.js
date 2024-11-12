// frontend/app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },
  
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上版本的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'env1-1gul8xe53e08531a', // 云环境 ID
        traceUser: true
      });
    }

    this.userLogin();
  },

  userLogin() {
    wx.cloud.callFunction({
      name: 'userLogin',
      success: res => {
        const { isNewUser, userInfo } = res.result;
        
        this.globalData.userInfo = userInfo;
        this.globalData.isLoggedIn = true;

        if (isNewUser) {
          wx.showToast({ title: '注册成功！', icon: 'success' });
        } else {
          wx.showToast({ title: '欢迎回来！', icon: 'success' });
        }
      },
      fail: err => {
        console.error('登录失败', err);
      }
    });
  }
});
