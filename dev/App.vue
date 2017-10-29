<template>
  <section id="app">
    <div class="btns">
      <span class="btn"
        v-for="btn in btns1"
        :key="btn.name" :style="btn.style"
        v-tip="getTip(btn.name)">
        {{ btn.name }}
      </span>
      <!-- 作为工具函数使用 -->
      <span class="btn" :key="btn.name"
        v-for="btn in btns2"
        :style="btn.style" @click="setTip($event, btn.name)">
        {{ btn.name }}
      </span>
    </div>
  </section>
</template>

<script>
import Vue from  'vue'
import Vtip from '../src/index.js'
import musics from './musics.js'
import Music from './music.vue'
import '../src/main.scss'

Vue.use(Vtip.directive)
Vue.prototype.$tip = Vtip.tip


const VW = window.innerWidth
const VH = window.innerHeight



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
    musics.forEach(it => {
      // this.btns1.push({
      //   name: it.name,
      //   style: getPosition()
      // })
      this.btns2.push({
        name: it.name,
        style: getPosition()
      })
    })
    return {
      target: null,
      content: Text,
      contentProps: {}
    }
  },

  methods: {

    // 工具函数使用
    setTip ({ target }, name) {
      this.$tip({
        target,
        width: 'auto',
        transition: true,
        customProps: { name },
        customComponent: Music
      })
    },

    getTip (name) {
      return {
        width: 'auto',
        theme: 'dark',
        transition: true,
        customComponent: Music,
        customProps: { name }
      }
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

#app {
  height: 100%;
  width: 100%;
  position: relative;
}

.btns {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: auto;

  .btn {
    text-align: left;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 12px;
    position: absolute;
    cursor: pointer;
  }
}
</style>
