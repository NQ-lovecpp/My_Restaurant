Page({
  data: {
    userInfo: null, // 用户信息
    hasUserInfo: false, // 是否已获取用户信息
    canIUseGetUserProfile: false // 是否支持 getUserProfile
  },

  onLoad() {
    // 检查是否支持 wx.getUserProfile
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }

    // 检查本地存储是否有用户信息
    const user = wx.getStorageSync('user');
    if (user) {
      this.setData({
        userInfo: user,
        hasUserInfo: true
      });
    }
  },

  // 使用 wx.getUserProfile 获取用户信息
  login() {
    wx.getUserProfile({
      desc: '用于展示账户信息', // 声明获取用户个人信息后的用途
      success: res => {
        console.log('获取到的用户信息:', res.userInfo);
        const user = res.userInfo;
        wx.setStorageSync('user', user);
        this.setData({
          userInfo: user,
          hasUserInfo: true
        });

        // 调用云函数注册或登录用户
        wx.cloud.callFunction({
          name: 'userLoginOrRegister',
          data: {
            userInfo: user
          },
          success: cloudRes => {
            console.log('登录或注册成功:', cloudRes.result);
            if (cloudRes.result && cloudRes.result.userInfo) {
              wx.setStorageSync('user', cloudRes.result.userInfo);
              this.setData({
                userInfo: cloudRes.result.userInfo
              });
            }
          },
          fail: err => {
            console.error('登录或注册失败:', err);
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: res => {
        console.log('授权失败', res);
        wx.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 退出登录
  loginOut() {
    this.setData({
      userInfo: null,
      hasUserInfo: false
    });
    wx.setStorageSync('user', null);
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  },

  // 页面跳转函数
  goMyorder() {
    wx.navigateTo({
      url: '/pages/myOrder/myOrder',
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  goMycomment() {
    wx.navigateTo({
      url: '/pages/mycomment/mycomment',
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  goAdmin() {
    wx.navigateTo({
      url: '/pages/admin/admin',
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  gopaihao() {
    wx.navigateTo({
      url: '/pages/paihao/paihao',
      fail: () => {
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }
});
