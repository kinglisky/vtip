import main from './main.vue'
export default {
  install (Vue, options) {
    options = options || {}
    const name = options.name || main.name
    Vue.component(name, main)
  }
}
