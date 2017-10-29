import Vue from 'vue'
import main from './main.vue'

const VtipConstructor = Vue.extend(main)

const props = main.props
const defaultOptions = {}
Object.keys(props).forEach(key => {
  const prop = props[key]
  const dv = prop.default
  if (prop && prop.default != null) {
    defaultOptions[key] = typeof dv === 'function' ? dv() : dv
  }
})

let vtipInstance = null

export default function tip (options) {
  options = options || {}
  // 如果已经存在 tip 的实例,直接更新属性值
  if (vtipInstance) {
    Object.assign(vtipInstance, defaultOptions, options)
    if (vtipInstance.target) {
      vtipInstance.updateTip()
    } else {
      vtipInstance.hiddenTip()
    }
    return vtipInstance
  }
  // 否则创建一个 tip 实例
  vtipInstance = new VtipConstructor({
    propsData: options
  }).$mount()
  vtipInstance.updateTip()
  return vtipInstance
}
