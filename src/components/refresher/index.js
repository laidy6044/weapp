// components/refresher/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    pullingIcon: `wux-refresher__icon--arrow-down`,
    pullingText: `下拉刷新`,
    refreshingIcon: `wux-refresher__icon--refresher`,
    refreshingText: `正在刷新`,
    disablePullingRotation: !1,
    distance: 30,
    lastTime: 0,
    // activated: !1,
    style: ``,
    defaultStyle: `transition: transform .4s; transform: translate3d(0px, 0px, 0px) scale(1);`,
    isRefreshing: !1, //是否正在刷新
    // onPulling() { },
    // onRefresh() { },
    refresherContainerTop: 0,
    isFirst: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 显示
    activate() {
      this.setData({ style: this.data.defaultStyle });
      this.setData({ className: `wux-refresher--visible` });
    },
    // 隐藏
    deactivate() {
      if (this.activated) this.activated = !1
      this.setData({ style: this.data.defaultStyle });
      this.setData({ className: `wux-refresher--hidden` });
    },
    // 正在刷新
    refreshing() {
      this.setData({ style: `transition: transform .4s; transform: translate3d(0, 50px, 0) scale(1);` });
      this.setData({ className: `wux-refresher--active wux-refresher--refreshing` })
    },
    // 刷新后隐藏动画
    tail() {
      this.setData({ className: `wux-refresher--active wux-refresher--refreshing wux-refresher--refreshing-tail` })
    },
    // 正在下拉
    move(diffY) {
      this.setData({ style: `transition-duration: 0s; transform: translate3d(0, ${diffY}px, 0) scale(1);` })
      this.setData({ className: diffY < this.data.distance ? `wux-refresher--visible` : `wux-refresher--active` })
    },
    /**
     * 获取触摸点坐标
     */
    getTouchPosition(e) {
      return {
        x: e.changedTouches[0].pageX,
        y: e.changedTouches[0].pageY,
      }
    },
    /**
       * 创建定时器
       */
    requestAnimationFrame(callback) {
      let currTime = new Date().getTime()
      let timeToCall = Math.max(0, 16 - (currTime - this.data.lastTime))
      let timeout = setTimeout(() => {
        callback.bind(this)(currTime + timeToCall)
      }, timeToCall)
      this.data.lastTime = currTime + timeToCall
      return timeout
    },
    /**
     * 下拉刷新完成后的函数
     */
    finishPullToRefresh() {
      setTimeout(() => {
        this.requestAnimationFrame(this.tail)
        setTimeout(() => this.deactivate(), 200)
      }, 200)
    },
    touchstart(e) {
      if (this.isRefreshing) return !1
	  let query = wx.createSelectorQuery().in(this)
      query.select('#refresherContainer').boundingClientRect((res) => {
        console.log('res: ', res)
        if (this.data.isFirst)
          this.setData({
            scrollTop: res.top,
            isFirst: false
          })
        if (res.top !== this.data.scrollTop) return !1
        const p = this.getTouchPosition(e)
        this.start = p
        this.diffX = this.diffY = 0
        this.activate()
      }).exec()
    },
    touchmove(e) {
      if (!this.start || this.isRefreshing) return !1
      const p = this.getTouchPosition(e)
      this.diffX = p.x - this.start.x
      this.diffY = p.y - this.start.y
      if (this.diffY < 0 || Math.abs(this.diffX) > Math.abs(this.diffY)) return !1
      this.diffY = Math.pow(this.diffY, 0.8)
      if (!this.activated && this.diffY > this.data.distance) {
        this.activated = !0
        // typeof this.data.onPulling === `function` && this.data.onPulling()
      } else if (this.activated && this.diffY < this.data.distance) {
        this.activated = !1
      }
      this.move(this.diffY)
    },
    touchend(e) {
      this.start = !1
      if (this.diffY <= 0 || this.isRefreshing) return !1
      this.deactivate()
      if (Math.abs(this.diffY) >= this.data.distance) {
        this.triggerEvent('refresh')
        this.refreshing()
        // typeof this.data.onRefresh === `function` && this.data.onRefresh()
      }
    }
  }
})
