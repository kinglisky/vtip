import Tip from './tip'

function clearEvent (el) {
  if (el._tipHandler) {
    el.removeEventListener('click', el._tipHandler)
    el.removeEventListener('mouseenter', el._tipHandler)
  }
  if (el._tipMouseleaveHandler) {
    el.removeEventListener('mouseleave', el._tipMouseleaveHandler)
  }
  delete el._tipInstance
  delete el._tipHandler
  delete el._tipOptions
  delete el._tipMouseleaveHandler
}

export default {
  install (Vue, options) {
    options = options || {}
    // 自定义指令的名字，默认为 tip
    const name = options.directiveName || 'tip'
    // tip 的展示方向
    const allDirection = ['top', 'right', 'bottom', 'left']

    Vue.directive(name, {
      bind (el, binding) {
        clearEvent(el)
        const { click, hover, keep } = binding.modifiers
        const direction = allDirection.filter(direc => binding.modifiers[direc])
        el._tipOptions = binding.value
        el._tipHandler = function tipHandler () {
          const options = this._tipOptions
          const mix = {
            direction,
            target: this,
            keep: Boolean(keep),
            duration: keep ? 800 : 2000
          }
          // 一般情况为 v-tip 绑定需要显示的内容
          // 特殊情况可以直接绑定一个配置对象
          const tipOptions = typeof options === 'string'
            ? Object.assign(mix, { content: options })
            : Object.assign(mix, options)
          this._tipInstance = Tip(tipOptions)
        }
        // 默认触发方式为 hover 触发
        if (click) {
          el.addEventListener('click', el._tipHandler)
        } else {
          el._tipMouseleaveHandler = function tipMouseleaveHandler () {
            if (this._tipInstance) {
              this._tipInstance.keep = false
              this._tipInstance.setTipVisible()
            }
          }
          el.addEventListener('mouseenter', el._tipHandler)
          el.addEventListener('mouseleave', el._tipMouseleaveHandler)
        }
      },

      update (el, { value, oldValue }) {
        if (value === oldValue) return
        el._tipOptions = binding.value
      },

      unbind (el) {
        clearEvent(el)
      }
    })
  }
}
