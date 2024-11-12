Page({
  data: {
    tabs: ['待上餐', '待评价', '已完成', '已取消'],
    currentTab: 0,
    list: [], // 当前订单列表
    isLoading: false // 用于跟踪加载状态
  },

  onLoad() {
    this.fetchOrderList(0); // 默认加载“待上餐”列表
  },

  // 切换顶部导航栏
  selectTab(event) {
    if (this.data.isLoading) return; // 正在加载时禁止切换
    let index = event.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    this.fetchOrderList(index); // 每次切换时加载对应状态的订单
  },

  // 获取订单列表，根据状态筛选
  fetchOrderList(status) {
    this.setData({ isLoading: true });
    wx.showLoading({ title: '加载中...', mask: true });

    wx.cloud.callFunction({
      name: 'getAllOrders',
      data: { status }, // 根据传入的状态筛选订单
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

  // 完成订单，将订单状态改为“待评价”
  completeOrder(e) {
    if (this.data.isLoading) return;
    let id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中...', mask: true });

    wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: { orderId: id, status: 1 }, // 1 表示待评价
      success: res => {
        if (res.result.success) {
          this.fetchOrderList(this.data.currentTab); // 更新列表
        } else {
          wx.showToast({ icon: 'error', title: '更新状态失败' });
        }
      },
      fail: err => {
        console.error('完成订单失败:', err);
        wx.showToast({ icon: 'error', title: '操作失败' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 恢复已取消订单至“待上餐”状态
  restoreOrder(e) {
    if (this.data.isLoading) return;
    let id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '恢复中...', mask: true });

    wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: { orderId: id, status: 0 }, // 0 表示待上餐
      success: res => {
        if (res.result.success) {
          this.fetchOrderList(this.data.currentTab); // 更新列表
        } else {
          wx.showToast({ icon: 'error', title: '恢复失败' });
        }
      },
      fail: err => {
        console.error('恢复订单失败:', err);
        wx.showToast({ icon: 'error', title: '操作失败' });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});
