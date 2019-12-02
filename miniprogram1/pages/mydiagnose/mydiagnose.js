// pages/mydiagnose/mydiagnose.js
Page({
  // 切换相机前后置摄像头
  devicePosition() {
    var thisBlock = this
    thisBlock.setData({
      device: !thisBlock.data.device,
    })
    console.log("当前相机摄像头为:", thisBlock.data.device ? "后置" : "前置");
  },

  diagnoseTongue() {
    var thisBlock = this
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log(">>>Following is the resource info gotten from takePhoto:")
        console.log(res)
        console.log(res.tempImagePath)
        wx.setStorageSync("tongueimg",res.tempImagePath);
        thisBlock.setData({
          camera: false,
        })        
      }
    })
    wx.navigateTo({
      url: '/pages/diagresult/diagresult?title=diagresult'
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    camera: true,
    device: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisBlock = this
    wx.getSystemInfo({
      success(res) {
        thisBlock.setData({
          windowHeight: res.windowHeight - 80,
          camera: true
        })
      }
    })
  },  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})