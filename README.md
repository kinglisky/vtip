# Vtip 一个基于 Vue 的简单 tooltip 工具

## 配置项

| 属性   | 说明 | 默认 |
| ---   | ---- | --- |
| title | `String` 内容标题 | `''` |
| content| `String` 显示的内容 | `''` |
| contentComponent | `[String, Function, Object]` 工具函数调用时可以通过 render 函数或者传入的自定义组件自定义显示内容, 组件使用时推荐用 slot 大法| '' |
| contentProps | `Object` 工具函数调用 contentComponent 时附加到自定义组件 props 上面的属性 | {} |
| target | `Element Objcet` vtip 绑定的目标元素，taget 元素更新时会触发 tip 会自动移动新的目标元素上面 | `null` |
| direction | `Array` 用于限制 tip 出现的方向 | ` ['top', 'right', 'bottom', 'left']` |
| keep | `Boolean` 是否保持 tip 的显示状态,默认 tip 经过 duration 后会自动隐藏 | `false` |
| duration | `Number` tip 窗口多久后自动消失，为 <=0 不消失 | `2000` |
| arrowsSize | `Number` 提示用的小箭头大小 | `14` |
| width | `[String, Number]` 组件的宽度 | `300px` |,
| height | `[String, Number]` 内容的高度 | `auto`|
| zIndex | `Number` tip 的 z-index | `9999` |
| customClass | `String` 组件自定义 class 的类名| '' |

## 事件

transend 每次 tip 更新动画完成位移或者隐藏时触发


## 作为组件使用

[基本用法 Codepen](https://codepen.io/kinglisky/pen/BZPpqx)

```vue
<template>
  <button @click="setTarget">SHOW TIP</button>
  <vtip class="custom-tip"
    title="Tip 标题"
    :content="content"
    :target="target">
    <div>作为组件直接使用时，可以只在 slot 中自定义渲染内容</div>
  </vtip>
</template>

<script>
import Vue from  'vue'
import Vtip from 'vtip'

// 可以配置组件的名字，默认为 Vtip
Vue.use(Vtip.component, { name: 'Vtip '})

export default {
  data () {
    return {
      content: 'tip 提示的内容',
      target: null
    }
  },

  methods: {
    setTarget ({ target }) {
      this.target = target
    }
  }
}
</script>
```

[限制 tip 展示方向 Codepen](https://codepen.io/kinglisky/pen/RgBpoy)

默认 direction = ['top', 'right', 'bottom', 'left']

direction 可限制 tip 展示方向，优先级按照数组中顺序，显示 tip 时：

先过滤出目标元素 direction 数组中可容纳 tip 的方向，例如 direction = ['top', 'right', 'bottom', 'left']，

但只有 ['top', 'bottom']，方向上足够容纳 tip，再根据 direction 的顺序，则显示最优的方向为 top，

如果 direction 所有方向都不足以容纳 tip，则取四个方向上空间最大的方向作为 tip 的显示方向

```vue
<template>
  <div>
    <button class="box box-1" @click="setTarget">BOX 1</button>
    <button class="box box-2" @click="setTarget">BOX 2</button>
    <button class="box box-3" @click="setTarget">BOX 3</button>
    <button class="box box-4" @click="setTarget">BOX 4</button>
    <vtip class="custom-tip"
      title="Tip 标题"
      :content="content"
      :target="target">
      <div>作为组件直接使用时，可以只在 slot 中自定义渲染内容</div>
    </vtip>
  </div>
</template>

<script>
import Vue from  'vue'
import Vtip from 'vtip'

Vue.use(Vtip.component)

export default {
  data () {
    return {
      content: 'tip 提示的内容',
      target: null
    }
  },

  methods: {
    setTarget ({ target }) {
      this.target = target
    }
  }
}
</script>
```

[其他选项 Codepen](https://codepen.io/kinglisky/pen/GEBmXo)

* keep: tip 默认显示经过 duration 后会自动隐藏，keep 为 true 时需要手动将 keep 设置为 false tip 选项才会隐藏

* contentComponent: 用于往 tip 中加入一些自定义组件。不过直接调用 vtip 组件来使用时，推荐用 slot 来自定义渲染内容。contentComponent 主要是 vtip 作为**工具函数**，和**指令**来使用时，用于自定义组件时使用的。这时候使用 contentComponent 可以很方便往 tip 塞进一些需要自定义渲染的内容。contentComponent 可以是一个组件或者自定的 render 函数，最终都会被渲染到 tip 内部的 `<component>` 组件上。

* contentProps: 加在自定义渲染组件上面的 props 属性。


```vue
<template>
  <div>
    <button @click="setTarget" class="box box1">未设置 keep</button>
    <button @click="setKeep" class="box box2">设置 keep</button>
    <vtip class="custom-tip"
      title="Tip 标题"
      :keep="keep"
      :content="content"
      :target="target"
      :content-props="contentProps"
      :content-component="contentComponent"
      @transend="target = null">
    </vtip>
  </div>
</template>

<script>
import Vue from  'vue'
import Vtip from 'vtip'
import CustomCompoent from '@/components/custom-compoent'
Vue.use(Vtip.component)

export default {
  data () {
      return {
        content: 'tip 提示的内容',
        target: null,
        keep: false,
        contentProps: null
      }
    },
  methods: {
    setTarget ({ target }) {
      this.keep = false
      this.contentComponent = this.customRender
      this.target = target
    },

    setKeep ({ target }) {
      this.contentProps = { name: '自定义 component 渲染' }
      this.contentComponent = CustomCompoent
      this.keep = true
      this.target = target
    },

    customRender (h) {
      return h('button', 'render 渲染的 button')
    }
  }
}
</script>
```


## 作为工具函数使用

[作为工具函数使用 codepen](https://codepen.io/kinglisky/pen/EXpvyg)

作为工具函数使用时，其实就是将 props 的配置传入 tip 函数中使用，配置直接参照组件 props 就行了。

作为工具函数使用时可使用 `contentComponent` 自定义渲染

```vue
<template>
  <div>
    <button class="box box-1" @click="setTip1">BOX 1</button>
    <button class="box box-1" @click="setTip2">BOX 1</button>
  </div>
</template>

<script>
import Vue from  'vue'
import Vtip from 'vtip'

Vue.prototype.$tip = Vtip.tip

export default {
  methods: {
    contentComponent (h) {
      return h('button', '鸩酿')
    },

    setTip1 ({ target }) {
      this.$tip({
        target,
        title: '风霜断面',
        content: '啦啦啦啦啦，这里是内容',
        contentComponent: this.contentComponent
      })
    },

    setTip2 ({ target }) {
      // tip 函数会创建返回一个 tip 的组件实例，可以直接调用组件实例的方法
      const tipInstance = this.$tip({
        target,
        title: '标题拉',
        keep: true,
        content: '啦啦啦啦啦，这里是内容，2333',
        contentComponent: this.contentComponent
      })

      setTimeout(() => {
        tipInstance.keep = false
        tipInstance.hiddenTip()
      }, 1000)
    }
  }
}
</script>
```

## 作为 directive 使用

[vtip 可以作为指令来使用 codepen](https://codepen.io/kinglisky/pen/KqBRvK)

```vue
<template>
  <div>
    <button class="box box1" v-tip="content">正常</button>
    <button class="box box2" v-tip.click="content">CLICK 触发</button>
    <button class="box box3" v-tip.keep="content">Hover keep</button>
    <button class="box box4" v-tip.top.bottom="content">限制方向为上下</button>
    <button class="box box5" v-tip="tipOptions">绑定一个配置项</button>
  </div>
</template>

<script>
import Vue from  'vue'
import Vtip from 'vtip'
// directiveName 用于配置 directive 的明智，默认为 tip
Vue.use(Vtip.directive, { directiveName: 'tip' })

export default {
  data () {
    return {
      content: CONTENT,
      tipOptions: {
        title: '月下蝉',
        content: CONTENT,
        contentComponent: this.contentComponent
      }
    }
  },

  methods: {
    contentComponent (h) {
      return h('button', { staticClass: 'c-btn' }, '鸩酿')
    }
  }
}
</script>
```


