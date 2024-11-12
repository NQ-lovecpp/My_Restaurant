Page({
  data: {
      tabs: ['待上餐', '待评价', '已完成', '已取消'],
      currentTab: 0,
      list: [], // 订单列表
      isLoading: false // 用于跟踪加载状态
  },
  
  // 选择顶部导航栏
  selectTab(event) {
      if (this.data.isLoading) return; // 正在加载时禁止切换
      let index = event.currentTarget.dataset.index;
      this.setData({ currentTab: index });
      if (index == 3) {
          index = -1;
      }
      this.fetchOrderList(index);
  },

  onLoad() {
      this.fetchOrderList(0); // 默认加载待上餐订单
  },

  // 获取订单列表
  fetchOrderList(status) {
      this.setData({ isLoading: true });
      wx.showLoading({
          title: '加载中...',
          mask: true // 阻塞住当前页面，只允许返回
      });

      wx.cloud.callFunction({
          name: 'getUserOrders',
          data: { status },
          success: res => {
              if (res.result.success) {
                  this.setData({ list: res.result.data });
              } else {
                  console.error('获取订单列表失败:', res.result.error);
              }
          },
          fail: err => {
              console.error('调用云函数失败:', err);
          },
          complete: () => {
              this.setData({ isLoading: false });
              wx.hideLoading();
          }
      });
  },

  // 取消订单
  cancelOrder(e) {
      if (this.data.isLoading) return; // 禁止重复操作
      let id = e.currentTarget.dataset.id;
      wx.showLoading({ title: '处理中...', mask: true });
      wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: { orderId: id, status: -1 }, // -1 表示取消
          success: res => {
              console.log('取消订单成功:', res);
              this.fetchOrderList(this.data.currentTab);
          },
          fail: err => {
              console.error('取消订单失败:', err);
          },
          complete: () => {
              wx.hideLoading();
          }
      });
  },

// 评价订单
evaluateOrder(e) {
  if (this.data.isLoading) return; // 禁止重复操作
  let id = e.currentTarget.dataset.id; // 获取订单 ID

  wx.showModal({
      title: '请输入评价内容',
      editable: true,
      success: res => {
          if (res.confirm && res.content) {
              wx.showLoading({ title: '提交中...', mask: true });
              
              wx.cloud.callFunction({
                  name: 'submitEvaluation',
                  data: {
                      orderId: id, // 只传递订单 ID
                      content: res.content // 用户输入的评价内容
                  },
                  success: res => {
                      console.log('评价提交成功:', res);
                      wx.showToast({ title: '提交成功' });
                      this.fetchOrderList(this.data.currentTab); // 刷新订单列表
                  },
                  fail: err => {
                      console.error('评价提交失败:', err);
                      wx.showToast({ icon: 'error', title: '提交失败' });
                  },
                  complete: () => {
                      wx.hideLoading();
                  }
              });
          } else {
              wx.showToast({ icon: 'error', title: '内容为空' });
          }
      }
  });
},


  // 查看评价
  viewEvaluation() {
      wx.navigateTo({ url: '/pages/mycomment/mycomment' });
  }
});
