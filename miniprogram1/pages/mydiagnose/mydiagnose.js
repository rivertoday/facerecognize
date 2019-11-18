// pages/mydiagnose/mydiagnose.js
Page({
  diagnoseTongue() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
        console.log(res)
        wx.uploadFile({
          //url: 'http://jituan.myvhost.com:8000/diagnose/', //仅为示例，非真实的接口地址 
          url: 'http://10.17.1.161:8000/diagnose/', //仅为示例，非真实的接口地址
          filePath: this.data.src,
          name: 'file',
          success: function (res) {
            var data = res.data
            var json = JSON.parse(data)
            console.log(json)
            console.log(json["conclusion"])
            if (json["conclusion"] == "MATCH") {
              wx.showModal({
                title: "提示",
                content: "我们找到了类似的舌头！\r\n识别分数为：" + json["score"] +"\r\n参考说明："+json["description"],
                showCancel: false,
                confirmText: "确定"
              })
              wx.downloadFile({
                url: 'http://10.17.1.161:8000/tonguedownload?name='+json["tongueimg"], //仅为示例，并非真实的资源
                success (dres) {
                  var that = this
                  that.setData({
                    tongueimg: dres.tempImagePath
                  })
                }
              })
            } else if (json["conclusion"] == "NOT LIKE") {
              wx.showModal({
                title: "提示",
                content: "抱歉，找到的舌头可能不像！\r\n识别分数为：" + json["score"] + "\r\n参考说明：" + json["description"],
                showCancel: false,
                confirmText: "确定"
              })
              wx.downloadFile({
                url: 'http://10.17.1.161:8000/tonguedownload?name=' + json["tongueimg"], //仅为示例，并非真实的资源
                success (dres) {
                  var that = this
                  that.setData({
                    tongueimg: dres.tempImagePath
                  })
                }
              })
            } else {
              wx.showModal({
                title: "警告",
                content: "对不起，找不到能匹配的舌头",
                showCancel: false,
                confirmText: "确定"
              })
            }

          },
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    tongueimg:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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