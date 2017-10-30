<template>
  <section id="app">
    <div class="btns">
      <span class="btn"
        :style="{ top: '100px', left: '300px' }"
        v-tip.dark="tempTip">
        CESHI
      </span>
      <!-- <span class="btn"
        v-for="btn in btns"
        :key="btn.name" :style="btn.style"
        v-tip="getTip(btn.id)">
        {{ btn.name }}
      </span> -->
      <!-- 作为工具函数使用 -->
      <!-- <span class="btn" :key="btn.name"
        v-for="btn in btns"
        :style="btn.style"
        @click="setTip($event, btn.id)"
        @mouseleave="hiddenTip">
        {{ btn.name }}
      </span> -->
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
    this.btns = []
    musics.forEach(it => {
      this.btns.push({
        name: it.name,
        id: it.id,
        style: getPosition()
      })
    })
    return {
      tempTip: {
        title: '标题',
        content: '今夕何夕，见此良人',
        theme: 'dark'
      },
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
        customComponent: Music,
        customProps: { id }
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
