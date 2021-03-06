// pages/diagresult/diagresult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rettongueimg: "",
    hintinfo: "",
    description:"",
  },

  upper(e) {
    console.log(e)
  },

  lower(e) {
    console.log(e)
  },

  scroll(e) {
    console.log(e)
  },

  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },

  tap() {
    for (let i = 0; i < order.length; ++i) {
      if (order[i] === this.data.toView) {
        this.setData({
          toView: order[i + 1],
          scrollTop: (i + 1) * 200
        })
        break
      }
    }
  },

  tapMove() {
    this.setData({
      scrollTop: this.data.scrollTop + 10
    })
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
    var thisBlock = this
    var tongueImagePath = wx.getStorageSync("tongueimg");
    console.log("diagresult get tongue path: "+tongueImagePath)
    thisBlock.setData({
      rettongueimg: tongueImagePath,
      hintinfo: "系统正在分析中……"
    })
    wx.uploadFile({
      url: 'http://10.17.1.161:8000/diagnose/', //仅为示例，非真实的接口地址
      filePath: tongueImagePath,
      name: 'file',
      success: function (res) {
        var data = res.data
        var json = JSON.parse(data)
        console.log(json)
        console.log(json["conclusion"])
        if (json["conclusion"] == "MATCH") {
          /*wx.showModal({
            title: "提示",
            content: "我们找到了类似的舌头！\r\n识别分数为：" + json["score"] + "\r\n参考说明：" + json["description"],
            showCancel: false,
            confirmText: "确定"
          })*/
          wx.downloadFile({
            url: 'http://10.17.1.161:8000/tonguedownload?name=' + json["tongueimg"], //仅为示例，并非真实的资源
            success(dres) {
              console.log(dres)
              console.log(">>>" + dres.tempFilePath)
              if (dres.statusCode === 200) {
                thisBlock.setData({
                  rettongueimg: dres.tempFilePath,
                  hintinfo: "分析完毕，下面是分析结果",
                  description: "我们找到了类似的舌头！\r\n识别分数为：" + json["score"] + "\r\n参考说明：" + json["description"],
                })
              }
            }
          })
        } else if (json["conclusion"] == "NOT LIKE") {
          /*wx.showModal({
            title: "提示",
            content: "抱歉，找到的舌头可能不像！\r\n识别分数为：" + json["score"] + "\r\n参考说明：" + json["description"],
            showCancel: false,
            confirmText: "确定"
          })*/
          wx.downloadFile({
            url: 'http://10.17.1.161:8000/tonguedownload?name=' + json["tongueimg"], //仅为示例，并非真实的资源
            success(dres) {
              console.log(dres)
              console.log(">>>" + dres.tempFilePath)
              if (dres.statusCode === 200) {
                thisBlock.setData({
                  rettongueimg: dres.tempFilePath,
                  hintinfo: "分析完毕，下面是分析结果",
                  description: "我们找到了类似的舌头！\r\n识别分数为：" + json["score"] + "\r\n参考说明：" + json["description"],
                })
              }
            }
          })
        } else {
          /*wx.showModal({
            title: "警告",
            content: "对不起，找不到能匹配的舌头",
            showCancel: false,
            confirmText: "确定"
          })*/
          thisBlock.setData({
            rettongueimg: dres.tempFilePath,
            hintinfo: "抱歉，未匹配分析到合适的图像",
            description: "请您重新拍照试试",
          })
        }

      },
      fail: function (res) {
        console.log(res)
      }
    })
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
    return {
      title: 'scroll-view',
      path: 'page/component/pages/scroll-view/scroll-view'
    }
  }
})