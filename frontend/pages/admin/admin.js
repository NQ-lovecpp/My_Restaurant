Page({
  data: {
      name: '',
      password: '',
      noLogin: true
  },
  onLoad() {
      let admin = wx.getStorageSync('admin');
      if (admin && admin.name && admin.password) {
          this.loginData(admin.name, admin.password);
      }
  },
  getName(e) {
      this.setData({ name: e.detail.value });
  },
  getPassword(e) {
      this.setData({ password: e.detail.value });
  },
  goLogin() {
      let name = this.data.name;
      let password = this.data.password;
      if (!name || !password) {
          wx.showToast({ icon: 'error', title: '请输入账号和密码' });
          return;
      }
      this.loginData(name, password);
  },
  loginData(name, password) {
      wx.cloud.callFunction({
          name: 'adminLogin',
          data: { name, password },
          success: res => {
              if (res.result.success) {
                  this.setData({ noLogin: false });
                  wx.setStorageSync('admin', { name, password });
                  wx.showToast({ title: '登录成功', icon: 'success' });
              } else {
                  wx.showToast({ icon: 'error', title: res.result.message });
                  wx.setStorageSync('admin', null);
              }
          },
          fail: err => {
              console.error('登录云函数调用失败:', err);
              wx.showToast({ icon: 'error', title: '登录失败，请稍后再试' });
          }
      });
  },
  loginout() {
      wx.setStorageSync('admin', null);
      this.setData({ noLogin: true });
  },
  goHouchu() {
      wx.navigateTo({
        url: '/pages/adminOrders/adminOrders',
      });
  },
  goPaihao() {
      wx.navigateTo({
        url: '/pages/adminPaihao/adminPaihao',
      });
  }
});
