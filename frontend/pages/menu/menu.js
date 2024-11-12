Page({
  data: {
    menuItems: [],
    cartItems: [],
    cartVisible: false,
    showItemDetail: false,
    selectedItem: {}, // 当前选择的菜品详情
    selectedItemQuantity: 1, // 初始化数量
    totalAmount: 0,
    tableNumber: 1, // 默认桌号
    showTableNumberModal: false,
    tempTableNumber: '' // 临时存储桌号输入
  },

  onLoad(options) {
    // 获取桌号信息
    if (options.table_number) {
      this.setData({ tableNumber: options.table_number });
    }
    wx.cloud.callFunction({
      name: 'getMenuList',
      success: res => {
        this.setData({ menuItems: res.result });
      },
      fail: err => {
        console.error('获取菜单数据失败', err);
      }
    });
  },


  // 显示修改桌号弹出框
  showTableNumberModal() {
    this.setData({ showTableNumberModal: true });
  },

  // 隐藏修改桌号弹出框
  hideTableNumberModal() {
    this.setData({ showTableNumberModal: false, tempTableNumber: '' });
  },

  // 输入桌号
  inputTableNumber(e) {
    this.setData({ tempTableNumber: e.detail.value });
  },

  // 通过扫码获取桌号
  scanTableNumber() {
    wx.scanCode({
      success: (res) => {
        const scannedTableNumber = res.result; // 假设二维码内容为桌号
        this.setData({ tempTableNumber: scannedTableNumber });
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' });
      }
    });
  },

  // 确认桌号
  confirmTableNumber() {
    const tableNumber = parseInt(this.data.tempTableNumber, 10);
    if (isNaN(tableNumber) || tableNumber <= 0) {
      wx.showToast({ title: '请输入有效桌号', icon: 'none' });
      return;
    }

    this.setData({
      tableNumber,
      showTableNumberModal: false,
      tempTableNumber: ''
    });

    wx.showToast({ title: `桌号已设置为 ${tableNumber}`, icon: 'success' });
  },

  // 显示菜品详情
  viewItemDetails(e) {
    const itemId = e.currentTarget.dataset.id;
    const item = this.data.menuItems.find(item => item.menu_item_id === itemId); // 通过 menu_item_id 查找菜品
    if (item) {
      this.setData({ selectedItem: item, showItemDetail: true, selectedItemQuantity: 1 });
    }
  },

  // 关闭菜品详情
  closeItemDetails() {
    this.setData({ showItemDetail: false, selectedItem: {} });
  },

  // 显示添加到购物车的弹窗
  showAddToCartModal(e) {
    this.viewItemDetails(e); // 正确获取点击的菜品详情
  },

  
  // 增加购物车中某个菜品的数量
  increaseQuantity(e) {
    const itemId = e.currentTarget.dataset.id;
    const cartItems = [...this.data.cartItems];
    const cartItem = cartItems.find(item => item.menu_item_id === itemId);

    if (cartItem) {
      cartItem.quantity += 1;
      cartItem.subtotal = (cartItem.price * cartItem.quantity).toFixed(2);
      this.setData({ cartItems });
      this.updateTotalAmount();
    }
  },

  // 减少购物车中某个菜品的数量
  decreaseQuantity(e) {
    const itemId = e.currentTarget.dataset.id;
    const cartItems = [...this.data.cartItems];
    const cartItemIndex = cartItems.findIndex(item => item.menu_item_id === itemId);

    if (cartItemIndex > -1) {
      const cartItem = cartItems[cartItemIndex];
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        cartItem.subtotal = (cartItem.price * cartItem.quantity).toFixed(2);
      } else {
        cartItems.splice(cartItemIndex, 1);
      }
      this.setData({ cartItems });
      this.updateTotalAmount();
    }
  },

  // 增加数量
  increaseDetailQuantity() {
    this.setData({ selectedItemQuantity: this.data.selectedItemQuantity + 1 });
  },

  // 减少数量
  decreaseDetailQuantity() {
    if (this.data.selectedItemQuantity > 1) {
      this.setData({ selectedItemQuantity: this.data.selectedItemQuantity - 1 });
    }
  },

  // 确认添加到购物车
  confirmAddToCart() {
    const menuItem = this.data.selectedItem;
    const quantityToAdd = this.data.selectedItemQuantity;
    const cartItemIndex = this.data.cartItems.findIndex(item => item.menu_item_id === menuItem.menu_item_id);

    if (cartItemIndex === -1) {
      this.setData({
        cartItems: [
          ...this.data.cartItems,
          {
            menu_item_id: menuItem.menu_item_id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: quantityToAdd,
            subtotal: (menuItem.price * quantityToAdd).toFixed(2)
          }
        ]
      });
    } else {
      const cartItems = [...this.data.cartItems];
      cartItems[cartItemIndex].quantity += quantityToAdd;
      cartItems[cartItemIndex].subtotal = (cartItems[cartItemIndex].price * cartItems[cartItemIndex].quantity).toFixed(2);
      this.setData({ cartItems });
    }

    this.updateTotalAmount();
    this.closeItemDetails();
  },

  // 显示购物车
  showCart() {
    this.setData({ cartVisible: true });
  },

  // 关闭购物车
  closeCart() {
    this.setData({ cartVisible: false });
  },

  // 更新总金额
  updateTotalAmount() {
    const totalAmount = this.data.cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
    this.setData({ totalAmount });
  },

  // 提交订单
  submitOrder() {
    wx.showLoading({
      title: '提交订单中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'submitOrder',
      data: { cartItems: this.data.cartItems, 
              totalAmount: this.data.totalAmount,
              tableNumber: this.data.tableNumber // 附加桌号信息
            },
      success: res => {
        wx.showToast({ title: '订单提交成功', icon: 'success' });
        this.setData({ cartItems: [], totalAmount: 0 });
        wx.navigateTo({ url: '/pages/myOrder/myOrder' }); // 跳转到 myOrder 页面
      },
      fail: err => {
        wx.showToast({ title: '订单提交失败', icon: 'none' });
        console.error('订单提交失败', err);
      },
      complete: () => {
        wx.hideLoading(); // 关闭加载动画
      }
    });
  }
});
