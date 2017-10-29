<template>
  <transition name="v-tip-fade">
    <div v-show="tipVisible"
      class="v-tip-container"
      :style="boxStyle"
      :class="boxClass"
      @mouseenter="mouseEntered = true"
      @mouseleave="mouseEntered = false">
      <div v-show="placement"
        class="v-tip-arrows"
        :class="placement"
        :style="arrowBox">
      </div>
      <span v-if="title" class="v-tip-title">
        {{ title }}
      </span>
      <p v-if="content"
        class="v-tip-content"
        :style="contentHeight">
        {{ content }}
      </p>
      <component
        v-if="customComponent"
        v-bind="customProps"
        v-on="customListeners"
        :is="customComponent"
        @hidden-tip="hiddenTip"
        @update-tip="updateTip">
      </component>
    </div>
  </transition>
</template>

<script>
import {
  debounce,
  checkScrollable,
  getScrollContainer,
  computeArrowPos,
  computePlacementInfo,
  computeCoordinateBaseMid,
  computeCoordinateBaseEdge
} from './util'

// passive support check
let supportsPassive = false
document.addEventListener('passive-check', () => {}, {
  get passive () { supportsPassive = { passive: true } }
})

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
    customProps: {
      type: Object,
      default () {
        return {}
      }
    },

    // 对应 <component> 组件 is 属性
    customComponent: {
      type: [String, Function, Object],
      default: ''
    },

    // 用于监听自定义组件 emit 的事件
    customListeners: Object,

    // tip 绑定的目标元素
    target: null,

    // tip 的容器，默认插入 body 中
    container: null,

    // 用于限制 tip 展示的方向，优先级按顺序
    placements: {
      type: Array,
      default () {
        return ['top', 'right', 'bottom', 'left']
      }
    },

    // tip 窗口多久后自动消失，为 <=0 不消失
    duration: {
      type: Number,
      default: 400
    },

     // 是否为 tip 添加 transfrom 过渡
    transition: Boolean,

    // 提示用的小箭头大小
    arrowsSize: {
      type: Number,
      default: 8
    },

    // 组件的宽度
    width: {
      type: [String, Number],
      default: '200px'
    },

    // 内容的高度
    height: {
      type: [String, Number],
      default: 'auto'
    },

    // tip 的 z-index
    zIndex: {
      type: Number,
      default: 999
    },

    // 主题 light dark 默认为 light
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
    this.containerNode = null
    this.targetParentNode = null
    this.visibleTimer = null
    return {
      // tip 的展示方向（小箭头的方向）
      placement: '',
      // 是否显示
      tipVisible: false,
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

    boxClass () {
      const { customClass, theme, transition } = this
      const tsClass = transition ? 'transition-transfrom' : ''
      return [customClass, theme, tsClass]
    },

    contentHeight () {
      const height = this.height
      return {
        height: typeof height === 'string' ? height : `${height}px`
      }
    }
  },

  watch: {
    mouseEntered (v) {
      if (!v) {
        this.setTipVisible(false)
      }
    }
  },

  beforeDestroy () {
    this.clearScrollEvent()
  },

  methods: {
    showTip () {
      clearTimeout(this.visibleTimer)
      this.tipVisible = true
    },

    // 隐藏 tip
    hiddenTip (immedia) {
      if (immedia) {
        this.tipVisible = false
      } else {
        this.setTipVisible(false)
      }
    },

    // 更新 tip 位置
    updateTip () {
      this.setContainerNode()
      this.showTip()
      this.asynSetCoordinate()
    },

    // 设置 tip 的容器
    setContainerNode () {
      const {
        $el,
        target,
        container,
        targetParentNode,
        containerNode: oldNode
      } = this
      // 目标元素的父级节点相同则不需要重新计算容器
      if (!target || target.parentNode === targetParentNode) return
      this.targetParentNode = target.parentNode
      const newNode = container || getScrollContainer(target)
      if (newNode === oldNode) return
      if ($el.parentNode !== newNode) {
        newNode.appendChild($el)
      }
      const position = window.getComputedStyle(newNode, null).position
      if (!position || position === 'static') {
        newNode.style.position = 'relative'
      }
      if (oldNode) {
        oldNode.removeEventListener('scroll', this.scrollHandler, supportsPassive)
      }
      if (checkScrollable(newNode)) {
        newNode.addEventListener('scroll', this.scrollHandler, supportsPassive)
      }
      this.containerNode = newNode
    },

    setCoordinate () {
      const { $el, target, containerNode, placements, arrowsSize } = this
      if (!$el || !target || !containerNode) return
      const placementInfo = computePlacementInfo(target, containerNode, $el, placements, arrowsSize)
      const coordinate = placementInfo.mod === 'mid'
        ? computeCoordinateBaseMid(placementInfo, arrowsSize)
        : computeCoordinateBaseEdge(placementInfo, arrowsSize)
      this.setArrowsPos(coordinate)
      this.placement = coordinate.placement
      const x = coordinate.x + containerNode.scrollLeft
      const y = coordinate.y + containerNode.scrollTop
      this.$el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    },

    asynSetCoordinate () {
      this.$nextTick(this.setCoordinate)
    },

    // 设置小三角形的位置
    setArrowsPos ({ placement, arrowsOffset }) {
      this.arrowsPos = computeArrowPos(placement, arrowsOffset, this.arrowsSize)
    },

    // 设置 tip 经过 duration ms 后的状态
    setTipVisible (v) {
      if (this.duration == null || this.duration <= 0) return
      clearTimeout(this.visibleTimer)
      this.visibleTimer = setTimeout(() => {
        this.tipVisible = v || this.mouseEntered
        this.visibleTimer = null
      }, this.duration)
    },

    // 参考元素父级容器发生滚动时的处理
    scrollHandler: debounce(function () {
      this.setCoordinate()
    }, 200),

    clearScrollEvent () {
      if (this.containerNode) {
        this.containerNode.removeEventListener('scroll', this.scrollHandler, supportsPassive)
      }
    }
  }
}
</script>
