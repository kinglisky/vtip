<template>
  <section id="app">
    <ul class="music-list">
      <li v-for="m in musics" :key="m.id"
        v-tip="getTip(m.id)">
        {{ m.name }}
      </li>
    </ul>
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
    return {
      musics,
      target: null,
      content: Text,
      contentProps: {}
    }
  },

  methods: {

    // 工具函数使用
    setTip ({ target }, id) {
      this.tipInstance = this.$tip({
        target,
        width: 'auto',
        transition: true,
        customProps: { id },
        customComponent: Music
      })
    },

    hiddenTip ({ target }) {
      const { tipInstance } = this
      if (tipInstance && tipInstance.target === target) {
        tipInstance.hiddenTip()
      }
    },

    getTip (id) {
      return {
        width: 'auto',
        theme: 'dark',
        transition: true,
        placements: ['right'],
        container: document.body,
        customComponent: Music,
        customProps: { id }
      }
    }
  }
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: PingFang SC, Verdana, Helvetica Neue, Microsoft Yahei, Hiragino Sans GB, Microsoft Sans Serif, WenQuanYi Micro Hei, sans-serif;
  font-size: 12px;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
}

.music-list {
  width: 300px;
  height: 600px;
  margin: 100px;
  border: 1px solid #ccc;
  overflow-y: auto;

  li {
    font-size: 12px;
    list-style: none;
    padding: 10px;
    border-bottom: 1px dotted #eee;
  }
}
</style>
