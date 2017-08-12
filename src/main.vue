<template>
  <transition name="tip-fade">
    <div v-show="visible"
      class="dt-tool-tip"
      :class="[customClass, theme]"
      :style="boxStyle"
      @mouseenter="mouseEntered = true"
      @mouseleave="mouseEntered = false"
      @transitionend="handleTransitionend">
      <div v-show="placement"
        class="arrows"
        :class="placement"
        :style="arrowBox">
      </div>
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
import {
  computePlacementInfo,
  computeCoordinateBaseMid,
  computeCoordinateBaseEdge
} from './util'

function computeArrowPos (placement, offset, size) {
  // 小三角的长边长度
  const start = offset + 'px'
  const end = offset - size * 2 + 'px'
  const posMap = {
    'top-start': { top: '100%', left: start },
    'top-mid': { top: '100%', left: '50%' },
    'top-end': { top: '100%', right: end },

    'bottom-start': { top: '0', left: start },
    'bottom-mid': { top: '0', left: '50%' },
    'bottom-end': { top: '0', right: end },

    'left-start': { top: start, left: '100%' },
    'left-mid': { top: '50%', left: '100%' },
    'left-end': { bottom: end, left: '100%' },

    'right-start': { top: start, left: '0' },
    'right-mid': { top: '50%', left: '0' },
    'right-end': { bottom: end, left: '0' }
  }
  return posMap[placement]
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
    placementQueue: {
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
      default: 8
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

    // 主题
    theme: {
      type: String,
      default: 'light'
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
      placement: '',
      // 是否显示
      visible: false,
      mouseEntered: false,
      arrowsPos: {}
    }
  },

  computed: {
    arrowBox () {
      return Object.assign({
        borderWidth: `${this.arrowsSize}px`
      }, this.arrowsPos)
    },

    boxStyle () {
      const width = this.width
      return {
        width: typeof width === 'string' ? width : `${width}px`,
        zIndex: this.zIndex
      }
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
        const { $el, target, placement, arrowsSize } = this
        const placementInfo = computePlacementInfo(target, $el, placement)
        const coordinate = placementInfo.mod === 'mid'
          ? computeCoordinateBaseMid(placementInfo, arrowsSize)
          : computeCoordinateBaseEdge(placementInfo, arrowsSize)
        this.setArrowsPos(coordinate)
        this.placement = coordinate.placement
        this.$el.style.left = coordinate.x + 'px'
        this.$el.style.top = coordinate.y + 'px'
      })
    },

    setArrowsPos (coordinate) {
      const { placement, arrowsOffset } = coordinate
      this.arrowsPos = computeArrowPos(placement, arrowsOffset, this.arrowsSize)
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
.dt-tool-tip {
  $light-bdc: #d9d9d9;
  $light-bgc: #fff;
  $light-ftc: #000;

  $dark-bdc: #1f2d3d;
  $dark-bgc: #1f2d3d;
  $dark-ftc: #fff;

  position: fixed;
  width: 200px;
  padding: 8px 10px;
  box-sizing: border-box;
  border: 1px solid $light-bdc;
  border-radius: 4px;
  box-shadow: 0 1px 6px rgba(0,0,0,.1);
  background: $light-bgc;
  font-size: 12px;
  color: $light-ftc;
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

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .arrows {
    position: absolute;
    height: 0;
    width: 0;
    z-index: -1;
    border-color: transparent;
    border-style: inherit;
    border-width: 10px;

    &::after {
      content: '';
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      border-color: transparent;
      border-width: inherit;
      border-style: inherit;
      transform: translate(-50%, -50%);
    }

    &[class^="top-"],
    &[class*=" top-"] {
      border-top-color: inherit;
      transform: translate(-50%, 0);

      &::after {
        border-top-color: $light-bgc;
        top: -2px;
      }
    }

    &[class^="bottom-"],
    &[class*=" bottom-"] {
      border-bottom-color: inherit;
      transform: translate(-50%, -100%);

      &::after {
        border-bottom-color: $light-bgc;
        top: 2px;
      }
    }

    &[class^="left-"],
    &[class*=" left-"] {
      border-left-color: inherit;
      transform: translate(0, -50%);

      &::after {
        border-left-color: $light-bgc;
        left: -2px;
      }
    }

    &[class^="right-"],
    &[class*=" right-"] {
      border-right-color: inherit;
      transform: translate(-100%, -50%);

      &::after {
        border-right-color: $light-bgc;
        left: 2px;
      }
    }
  }

  &.dark {
    border-color: $dark-bdc;
    background: $dark-bgc;
    color: $dark-ftc;

    [class^="top-"],
    [class*=" top-"] {
      &::after {
        border-top-color: $dark-bdc;
      }
    }

    [class^="bottom-"],
    [class*=" bottom-"] {
      &::after {
        border-bottom-color: $dark-bdc;
      }
    }

    [class^="left-"],
    [class*=" left-"] {
      &::after {
        border-left-color: $dark-bdc;
      }
    }

    [class^="right-"],
    [class*=" right-"] {
      &::after {
        border-right-color: $dark-bdc;
      }
    }
  }

  &.tip-fade-enter,
  &.tip-fade-leave-active {
    opacity: 0
  }
}
</style>
