import Vue from 'vue'

const VtipConstructor = Vue.extend(require('./main.vue'))

let vtipInstance = null

export default function tip (options) {
  options = options || {}
  const instance = new VtipConstructor({
    propsData: options
  })
  // 如果已经存在 tip 的实例则移除
  if (vtipInstance && vtipInstance.$el) {
    document.body.removeChild(vtipInstance.$el)
  }
  vtipInstance = instance.$mount()
  document.body.appendChild(vtipInstance.$el)
  vtipInstance.visible = true
  vtipInstance.setTipCoordinate()
  vtipInstance.setTipVisible()
  return vtipInstance
}
