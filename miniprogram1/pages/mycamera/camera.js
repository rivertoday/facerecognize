// camera.js
Page({
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
      }
    })
  },
  verifyPhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
        /*
        wx.showModal({
          title: "提示",
          content: "我来打个酱油！",
          showCancel: false,
          confirmText: "确定"
        })
        */
        console.log(res)
        wx.uploadFile({
          url: 'http://jituan.myvhost.com:8000/verify/', //仅为示例，非真实的接口地址 
          filePath: this.data.src,
          name: 'file',
          success: function(res) {
            var data = res.data
            var json = JSON.parse(data)
            console.log(json)
            console.log(json["conclusion"])
            if (json["conclusion"]=="MATCH") {
              wx.showModal({
                title: "提示",
                content: "恭喜，识别成功！\r\n识别分数为：" + json["score"],
                showCancel: false,
                confirmText: "确定"
              })
            } else if (json["conclusion"] == "NOT LIKE") {
              wx.showModal({
                title: "提示",
                content: "抱歉，我们觉得你不像！\r\n识别分数为：" + json["score"],
                showCancel: false,
                confirmText: "确定"
              })
            } else {
              wx.showModal({
                title: "警告",
                content: "对不起，您不是我们的用户",
                showCancel: false,
                confirmText: "确定"
              })
            }
            
          },
          fail:function(res) {
            console.log(res)
          }
        })
      }
    })
  },
  /*
  devicePosition() {
    this.setData({
      device: !this.data.device,
    })
    console.log("当前相机摄像头为:", this.data.device ? "后置" : "前置");
  },
  camera() {
    let {
      ctx,
      type,
      startRecord
    } = this.data,
  },

  data: {
    src: null,
  },
  */
  error(e) {
    console.log(e.detail)
  }
})