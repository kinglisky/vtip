# Vtip 文档

安装：

> npm i vue -S

> npm i vtip -S

使用：


```javascript
import Vtip from 'vtip'
import 'vtip/lib/index.min.css'
// 注册指令使用
Vue.use(Vtip.directive)
// 工具函数调用
Vue.prototype.$tip = Vtip.tip
```


## 作为指令来使用

推荐的使用方式为注册指令来使用，默认的指令名称为 `v-tip`。如果想用其他名称可以在 `Vue.use` 进行配置。

```javascript
Vue.use(Vtip.directive, { directiveName: 'otherName' })
```

如果只是作为过长文案提示，可以直接绑定一个需要显示文案信息来使用：

```html
<span v-tip="msg">{{ msg }}</span>
```

指标的修饰符：

```html
<span v-tip.top.dark.click="msg">{{ msg }}</span>
```
`click`： 点击触发，默认由 hover 触发

`dark`：使用黑色主题，默认为 `light`

`top right bottom left`： 可用于设置 tip 优先显示方向

`transition`: 是否为 tip 设置 tranfrom 过渡效果

如果还想进一步自定义 tip 显示，`v-tip` 指令支持绑定一个配置对象进行更配置：

```html
<button v-tip.right="options">
  指令使用-绑定一个对象
</button>
```

对应的 `options` 详细配置说明可以参考参数说明

```javascript
const options = {
  title: '这里是标题',
  content: '显示内容',
  theme: 'dark',
  //  tip 的容器，在不设置的情况下，tip 会自动在参考元素的父级元素上面查找合适的容器，但推荐手动设置一个 tip 对象容器
  container: document.body,
  customProps: { msg: '自定义渲染' },
  // 这里通过 customComponent 定义了一个自定义组件
  customComponent: Vue.extend({
    props: ['msg'],
    render (h) {
      return h('span', this.msg)
    }
  }),
  placements: ['top', 'buttom'],
  duration: 400,
  transition: true
  ...
}
```


可以看下面的例子：

一般情况下指令都能满足 tip 的显示需要，但有时可能需要通过工具函数的形式来调用 tip 显示，这时就可以使用 `Vtip` 提供的 `tip` 工具函数了，`v-tip` 的指令是居于 `tip` 函数实现的。

## 作为工具函数来使用

Vtip 有提供一个工具函数，可直接调用 `tip` 工具函数进行内容的展示：


```
Vue.prototype.$tip = Vtip.tip
```

自定义组件 `custom.vue`
```html
<template>
  <div>
    <span>{{ msg }}</span>
    <button @click="handler">确认</button>
  </div>
</template>

<script>
export default {
  props: {
    msg: String,
    handler: Function
  },

  created () {
    this.$emit('created')
  }
}
</script>
```


```javascript
import Custom from 'components/custom.vue'
const tipInstance = this.$tip({
  target: this.$el, // tip 的参考元素
  width: 400,
  content: '提示显示内容',
  // customProps 传递 customComponent 组件的需要的 props
  customProps: {
    msg: '自定义渲染内容',
    handler () {
      console.log('click')
    }
  },
  // 用于监听自定义组件的 emit 事件
  customListeners: {
    created () {
      console.log('created')
    }
  }
  customComponent: Custom
  ...
})

// 隐藏 tip
tipInstance.hiddenTip()
tipInstance.updateTip()
...
```

作为工具函数调用时会返回一个 tip 的组件实例，可直接调用组件的方法对 `tip` 实例进行控制操作。


## 配置参数

| 属性   | 说明 | 默认 |
| ---   | ---- | --- |
| title | `String` 内容标题 | `''` |
| content| `String` 显示的内容 | `''` |
| theme| `String` 主题色调 `light dark` | `'light'` |
| customComponent | `[String, Function, Object]` <br>工具函数与指令调用时，可以通过 customComponent 传递自定义组件来渲染自定义内容| `''` |
| customProps | `Object` 附加到 customComponent 自定义组件 props 上面的值 | `{}` |
| customListeners | `Object` 用监听 customComponent 自定义组件内部 emit 的事件 <br> 注意：这里使用了 vue 2.4 新加 v-on 新语法, 小于 2.4 的版本的 vue 不支持此特性，若有需要处理自定义组件的事件可以通过 customProps 传入处理函数实现| `{}` |
| target | `Element Objcet` tip 绑定的目标元素 | `null` |
| container | `Element Objcet` tip 父级容器，未设置容器是 tip 会自动从 `target` 元素的父级容器中挑选出一个合适的节点作为 tip 的容器 <br> 推荐为 tip 手动指定一个显示容器 | `-` |
| placements | `Array` 用于设置 tip 显示的优先级 | ` ['top', 'right', 'bottom', 'left']` |
| duration | `Number` tip 窗口多久后自动消失 | `400` |
| arrowsSize | `Number` 提示用的小箭头大小 | `8` |
| width | `[String, Number]` 组件的宽度 | `300px` |
| height | `[String, Number]` 内容的高度 | `auto`|
| zIndex | `Number` tip 的 z-index | `9999` |
| customClass | `String` 组件自定义 class 的类名 | `''` |
| transition | `Boolean` 是否为组件添加 transfrom 过渡 | `false` |

`customComponent` 用于往 tip 中塞一些自定义的组件，内部实现实际上使用 `<component>` 组件：

```html
<component :is="customComponent" v-bind="customProps" v-on="customListeners"></component>
```

所以 `customComponent` 的值与 `<component>` 组件的 `is` 属性相同。


`customProps` 其实就是附加给自定义组件 `customComponent` 上的 `props` 参数，有时候可以将处理函数以 props 的形式传入便于处理自定义组件内部的事件。


`customListeners` 基于 Vue 2.4 引入 `v-on` 新语法实现，`v-on` 直接可直接绑定一个事件对象如：`{ mousedown: doThis, mouseup: doThat }` 。通过传入的 `customListeners` 可以方便的处理自定义组件内部的 `emit` 出的事件。当 Vue 版本小于 2.4 不支持此语法时，我们可以通过 `customComponent` 传处理函数实现事件处理。


`placements` 用于限制 tip 的显示方向与各个方向的优先级。

例如 `placements` 设置为 `['top', 'right']` tip 会优先尝试在 top 与 right 方向上显示 tip。

如果 top 与 right 方向上都可显示 tip 内容，优先在 top 方向上显示。

如果 top 与 right 上都不足以容纳 tip 内容，则会在 tip 会自动在选择一个可容纳 tip 方向展示。


## 组件方法

| 方法  | 说明 | 参数 |
| ---  | ---  | --- |
| showTip() | 显示 tip | - |
| hiddenTip(immedia) | 隐藏 tip | `immedia` 是否立即隐藏 tip |
| updateTip()  | 显示更新 tip 位置 |  - |
| destroy() | 销毁 tip 实例，一般不需要调用 |-|

附：组件内部有监听 `customComponent` 自定义组件 emit 出的 `hidden-tip` 事件与 `update-tip` 事件，对应触发 `hiddenTip` 与 `updateTip` 方法。
