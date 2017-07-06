<template>
  <section class="examples-page">
    <vtip
      title="蓝书签"
      height="200px"
      :keep="keep"
      :content="content"
      :content-props="contentProps"
      :content-component="contentComponent"
      :target="target"
      @transend="target = null">
      <p>啦啦啦啦啦啦啦啦</p>
    </vtip>
    <div class="btns">
      <!-- 作为组件使用 -->
      <span class="btn"
        v-for="(btn, index) in btns1"
        :key="index" :style="btn"
        @mouseenter="setTarget">
        组件使用 {{ index }}
      </span>
      <!-- 作为工具函数使用 -->
      <span class="btn" :style="btns2[0]" @click="setTip1">
        工具函数 1
      </span>
      <span class="btn" :style="btns2[1]" @click="setTip2">
        工具函数 2
      </span>
      <!-- 指令使用 -->
    </div>
  </section>
</template>

<script>
import Vue from  'vue'
import Vtip from '../src/index.js'
import Content from './content.vue'
import Text from './text.js'
import Anohanan from './anohana.gif'

Vue.use(Vtip.component)
Vue.use(Vtip.directive)
Vue.prototype.$tip = Vtip.tip

const VBOX = Vtip.util.getClientView()
const VW = VBOX.vw
const VH = VBOX.vh


function getPosition () {
  return {
    left: Math.random() * (VW - 100) + 'px',
    top: Math.random() * (VH - 100) + 'px'
  }
}

export default {
  data () {
    this.btns1 = []
    this.btns2 = []
    for (let i = 0; i < 3; i++) {
      this.btns1.push(getPosition())
      this.btns2.push(getPosition())
    }
    return {
      keep: false,
      target: null,
      content: Text,
      contentProps: {}
    }
  },

  methods: {
    setTarget ({ target }) {
      if (target.classList.contains('btn')) {
        this.target = target
      }
    },

    // 工具函数使用
    setTip1 ({ target }) {
      this.$tip({
        target,
        title: 'keep false | tip 自动消失',
        contentComponent: this.contentComponent
      })
    },

    setTip2 ({ target }) {
      this.$tip({
        target,
        keep: true,
        title: 'keep true | tip 保持显示',
        contentComponent: this.contentComponent
      })
    },

    contentComponent (h) {
      return h('img', {
        staticClass: 'anohana-img',
        attrs: { src: Anohanan }
      })
    }
  }
}
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  font-family: PingFang SC, Verdana, Helvetica Neue, Microsoft Yahei, Hiragino Sans GB, Microsoft Sans Serif, WenQuanYi Micro Hei, sans-serif;
}

.btns {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  overflow: hidden;

  .btn {
    width: 100px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px 0;
    position: absolute;
    cursor: pointer;
  }
}

.anohana-img {
  display: block;
  width: 100%;
}
</style>
