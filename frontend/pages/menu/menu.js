Page({
  data: {
    menuItems: [],
    cartItems: [],
    cartVisible: false,
    showItemDetail: false,
    selectedItem: {},
    totalAmount: 0
  },

  onLoad() {
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

  // 显示菜品详情
  viewItemDetails(e) {
    const itemId = e.currentTarget.dataset.id;
    const item = this.data.menuItems.find(item => item.id === itemId);
    if (item) {
      this.setData({ selectedItem: item, showItemDetail: true });
    }
  },

  // 关闭菜品详情
  closeItemDetails() {
    this.setData({ showItemDetail: false, selectedItem: {} });
  },

  // 添加菜品到购物车
  addToCart(e) {
    const itemId = e.currentTarget.dataset.id;
    const menuItem = this.data.menuItems.find(item => item.menu_item_id === itemId);
    if (!menuItem) return;

    const cartItemIndex = this.data.cartItems.findIndex(item => item.menu_item_id === itemId);
    if (cartItemIndex === -1) {
      this.setData({
        cartItems: [
          ...this.data.cartItems,
          {
            menu_item_id: menuItem.menu_item_id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            subtotal: menuItem.price
          }
        ]
      });
    } else {
      const cartItems = [...this.data.cartItems];
      cartItems[cartItemIndex].quantity += 1;
      cartItems[cartItemIndex].subtotal = (cartItems[cartItemIndex].price * cartItems[cartItemIndex].quantity).toFixed(2);
      this.setData({ cartItems });
    }

    this.updateTotalAmount();
  },

  // 显示购物车
  showCart() {
    this.setData({ cartVisible: true });
  },

  // 关闭购物车
  closeCart() {
    this.setData({ cartVisible: false });
  },

  // 增加数量
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

  // 减少数量
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

  // 更新总金额
  updateTotalAmount() {
    const totalAmount = this.data.cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
    this.setData({ totalAmount });
  },

  // 提交订单
  submitOrder() {
    wx.cloud.callFunction({
      name: 'submitOrder',
      data: { cartItems: this.data.cartItems, totalAmount: this.data.totalAmount },
      success: res => {
        wx.showToast({ title: '订单提交成功', icon: 'success' });
        this.setData({ cartItems: [], totalAmount: 0 });
      },
      fail: err => {
        wx.showToast({ title: '订单提交失败', icon: 'none' });
        console.error('订单提交失败', err);
      }
    });
  }
});
