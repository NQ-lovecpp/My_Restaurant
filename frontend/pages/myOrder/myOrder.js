let app = getApp()
const db = wx.cloud.database()
Page({
    data: {
        tabs: ['待上餐', '待评价', '已完成', '已取消'],
        currentTab: 0
    },
    // 选中顶部顶部导航栏
    selectTab(event) {
        let index = event.currentTarget.dataset.index
        console.log(event.currentTarget.dataset.index)
        this.setData({
            currentTab: index
        })
        if (index == 3) {
            index = -1
        }
        this.getList(index)
    },
    onLoad() {
        this.getList(0)
    },
    getList(status) {
        db.collection('order')
            .where({
                status: status
            })
            .get()
            .then(res => {
                console.log('请求到的订单列表', res)
                this.setData({
                    list: res.data
                })
            })
            .catch(res => {
                console.log('请求到的订单列表失败', res)
            })
    },
    //  取消订单
    quxiao(e) {
        let id = e.currentTarget.dataset.id
        db.collection('order').doc(id)
            .update({
                data: {
                    status: -1
                }
            }).then(res => {
                console.log('取消订单的结果', res)
                this.getList(0)
            }).catch(res => {
                console.log('取消订单失败', res)
            })
    },
    pingjia(e) {
        let id = e.currentTarget.dataset.id
        console.log(id)
        let user = wx.getStorageSync('user')
        console.log('用户信息', user)
        wx.showModal({
            title: '请输入评价内容',
            editable: true,
            cancelColor: '取消',
            success: res => {
                if (res.confirm) {
                    console.log('用户输入的内容', res.content)
                    if (res.content) {
                        db.collection('pinglun').add({
                            data: {
                                name: user.nickName,
                                orderId: id,
                                avatarUrl: user.avatarUrl,
                                content: res.content,
                                time: app.getCurrentTime()
                            }
                        }).then(res => {
                            console.log('评价成功', res)
                            db.collection('order').doc(id)
                                .update({
                                    data: {
                                        status: 2
                                    }
                                }).then(res => {
                                    console.log('评价订单的结果', res)
                                    this.getList(0)
                                }).catch(res => {
                                    console.log('评价订单失败', res)
                                })
                            wx.showToast({
                                title: '提交成功',
                            })
                        })
                    } else {
                        wx.showToast({
                            icon: 'error',
                            title: '内容为空',
                        })
                    }
                } else {
                    console.log('用户点击了取消')
                }
            }
        })
    },
    // 跳转到评价列表页
    chakanpingjia() {
        wx.navigateTo({
            url: '/pages/mycomment/mycomment',
        })
    }
})