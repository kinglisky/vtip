<template>
  <transition name="tip-fade">
    <div v-show="visible"
      class="vue-easy-tool-tip"
      :class="boxClass"
      :style="boxStyle"
      @mouseenter="mouseEntered = true"
      @mouseleave="mouseEntered = false"
      @transitionend="handleTransitionend">
      <div class="arrows" :class="direct" :style="arrowBox"></div>
      <h4 v-if="title" class="title" v-text="title"></h4>
      <pre v-if="content"
        class="content"
        v-text="content"
        :style="contentHeight">
      </pre>
      <component
        v-if="contentComponent"
        v-bind="contentProps"
        :is="contentCreator">
      </component>
      <slot></slot>
    </div>
  </transition>
</template>

<script>
import { getBestCoordinate } from './util.js'

function getPoint (bestDirect, box) {
  const { direct, x, y } = bestDirect
  const { width, height } = box
  const halfWdith = width / 2
  const halfHeight = height / 2
  const offset = 10 // 三角形大小
  switch (direct) {
    case 'top': return { x: x - halfWdith, y: y - height - offset }
    case 'bottom': return { x: x - halfWdith, y: y + offset  }
    case 'left': return { x: x - width - offset, y: y - halfHeight }
    case 'right': return { x: x + offset, y: y - halfHeight  }
  }
}

export default {
  name: 'Vtip',

  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },

    // 显示的内容
    content: {
      type: String,
      default: ''
    },

    // 工具函数调用时附加到自定义组件 props 上面的
    contentProps: {
      type: Object,
      default () {
        return {}
      }
    },

    // 工具函数调用时可以通过 render 函数或者传入的自定义组件自定义显示内容
    // 组件使用时推荐用 slot 大法
    contentComponent: [String, Function, Object],

    // tool-tip 绑定的目标元素
    target: null,

    // 用于限制 tip 出现的方向
    direction: {
      type: Array,
      default () {
        return ['top', 'right', 'bottom', 'left']
      }
    },

    // 是否保持 tip 的显示状态
    keep: Boolean,

    // tip 窗口多久后自动消失，为 <=0 不消失
    duration: {
      type: Number,
      default: 2000
    },

    // 提示用的小箭头大小
    arrowsSize: {
      type: Number,
      default: 14
    },

    // 组件的宽度
    width: {
      type: [String, Number],
      default: '300px'
    },

    // 内容的高度
    height: {
      type: [String, Number],
      default: 'auto'
    },

    // tip 的 z-index
    zIndex: {
      type: Number,
      default: 9999
    },

    // 自定义 class 的类名
    customClass: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      // tip 的展示方向（小箭头的方向）
      direct: '',
      // 是否显示
      visible: false,
      mouseEntered: false
    }
  },

  computed: {
    arrowBox () {
      return {
        width: `${this.arrowsSize}px`,
        height: `${this.arrowsSize}px`
      }
    },

    boxStyle () {
      const width = this.width
      return {
        width: typeof width === 'string' ? width : `${width}px`,
        zIndex: this.zIndex
      }
    },

    boxClass () {
      return [this.direct, this.customClass]
    },

    contentHeight () {
      const height = this.height
      return {
        height: typeof height === 'string' ? height : `${height}px`
      }
    },

    contentCreator () {
      const contentComponent = this.contentComponent
      return typeof contentComponent === 'function'
        ? { render: contentComponent }
        : contentComponent
    }
  },

  watch: {
    target (target) {
      if (target && this.$el) {
        this.visible = true
        this.setTipVisible()
        this.setTipCoordinate()
      }
    },

    keep (v) {
      if (!v) {
        this.setTipVisible()
      }
    },

    mouseEntered (v) {
      if (!v) {
        this.setTipVisible()
      }
    }
  },

  methods: {
    // 设置 tip 的位置
    setTipCoordinate () {
      this.$nextTick(() => {
        const { $el, target, direction } = this
        const { bestDirect, elBox } = getBestCoordinate($el, target, direction)
        const point = getPoint(bestDirect, elBox)
        this.direct = bestDirect.direct
        this.$el.style.left = point.x + 'px'
        this.$el.style.top = point.y + 'px'
      })
    },

    // 设置 tip 的显示与否
    setTipVisible () {
      clearTimeout(this.visibleTimer)
      if (this.duration <= 0) return
      this.visibleTimer = setTimeout(() => {
        this.visible = this.keep || this.mouseEntered
        this.visibleTimer = null
      }, this.duration)
    },

    handleTransitionend ({ propertyName }) {
      if (propertyName === 'opacity' || propertyName === 'left') {
        this.$emit('transend')
      }
    },

    hiddenTip () {
      this.visible = false
    }
  },

  created () {
    this.visibleTimer = null
  }
}
</script>

<style lang="scss">
.vue-easy-tool-tip {
  $borderColor: #ddd;
  $mask: #fff;

  position: fixed;
  width: 200px;
  box-sizing: border-box;
  padding: 6px 8px;
  border: 1px solid $borderColor;
  border-radius: 4px;
  box-shadow: 3px 3px 10px $borderColor;
  position: fixed;
  background: $mask;
  font-size: 12px;
  z-index: 9999;
  transition:
    opacity .3s,
    top .5s cubic-bezier(0.4, 0, 0.2, 1),
    left .5s cubic-bezier(0.4, 0, 0.2, 1);

  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  .title {
    padding: 4px 0;
    font-size: 14px;
    font-weight: 400;
  }

  .content {
    padding: 0;
    line-height: 2;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-y: auto;
    background: $mask;
  }

  .arrows {
    position: absolute;
    height: 14px;
    width: 14px;
    border: inherit;
    z-index: -1;
    background: $mask;
    transform: translate(-50%, -50%) rotate(45deg);
    display: none;

    &.top, &.bottom {
      left: 50%;
      display: block;
    }
    &.top {
      top: 100%;
      border-top: none;
      border-left: none;
    }
    &.bottom {
      top: 0;
      border-bottom: none;
      border-right: none;
    }
    &.left,&.right {
      top: 50%;
      display: block;
    }
    &.left {
      left: 100%;
      border-bottom: none;
      border-left: none;
    }
    &.right {
      left: 0;
      border-top: none;
      border-right: none;
    }
  }

  &.tip-fade-enter, &.tip-fade-leave-active {
    opacity: 0
  }
}
</style>
