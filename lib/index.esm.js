import Vue from 'vue';

var OVERFLOW_PROPERTYS = ['overflow', 'overflow-x', 'overflow-y'];

var SCROLL_TYPES = ['scroll', 'auto'];

// 根元素
var ROOT = document.body;

// 竖直方向
var VERTICAL = ['top', 'bottom'];
// 水平方向
var HORIZONTAL = ['left', 'right'];

// 默认限制显示方向如下，显示优先级按顺序以此递减
var DEFAULT_PLACEMENT_QUEUE = ['top', 'right', 'bottom', 'left'];

// 最大值
var MAX = 4;

// 获取目标元素相对于参考容器的位置信息
function getBoxMargin(el, parent) {
  if (!el) return;
  var eBox = el.getBoundingClientRect();
  var pBox = parent.getBoundingClientRect();

  var vw = pBox.width,
      vh = pBox.height;
  var width = eBox.width,
      height = eBox.height;


  var top = eBox.top - pBox.top;
  var left = eBox.left - pBox.left;
  var right = eBox.right - pBox.left;
  var bottom = eBox.bottom - pBox.top;

  var midX = left + width / 2;
  var midY = top + height / 2;

  // 目标的顶点坐标 [top-left, top-right, bottom-right, botton-left]
  var vertex = {
    tl: { x: left, y: top },
    tr: { x: right, y: top },
    br: { x: right, y: bottom },
    bl: { x: left, y: bottom }
  };

  return {
    width: width,
    height: height,
    margin: {
      top: {
        placement: 'top',
        size: top,
        start: vertex.tl,
        mid: { x: midX, y: top },
        end: vertex.tr
      },
      bottom: {
        placement: 'bottom',
        size: vh - bottom,
        start: vertex.bl,
        mid: { x: midX, y: bottom },
        end: vertex.br
      },
      left: {
        placement: 'left',
        size: left,
        start: vertex.tl,
        mid: { x: left, y: midY },
        end: vertex.bl
      },
      right: {
        placement: 'right',
        size: vw - right,
        start: vertex.tr,
        mid: { x: right, y: midY },
        end: vertex.br
      }
    }
  };
}

// 获取最优展示方向，weight 越大对应方向的优先级越高
function getBestPlacement(queue) {
  return queue.sort(function (a, b) {
    return b.weight - a.weight;
  })[0];
}

// 是否是个可滚动的元素
function checkScrollable(element) {
  var css = window.getComputedStyle(element, null);
  return OVERFLOW_PROPERTYS.some(function (property) {
    return ~SCROLL_TYPES.indexOf(css[property]);
  });
}

// 获取参考元素第一个可滚动的元素
function getScrollContainer(el) {
  if (!el) return ROOT;
  var parent = el.parentNode;
  while (parent && parent !== ROOT) {
    if (checkScrollable(parent)) {
      return parent;
    }
    parent = parent.parentNode;
  }
  return ROOT;
}

// 基于参考元素的某一侧的中点来计算目标元素的坐标
function computeCoordinateBaseMid(placementInfo, offset) {
  var placement = placementInfo.placement,
      mid = placementInfo.mid,
      tw = placementInfo.tw,
      th = placementInfo.th;

  switch (placement) {
    case 'top':
      return {
        placement: 'top-mid',
        x: mid.x - tw / 2,
        y: mid.y - th - offset
      };
    case 'bottom':
      return {
        placement: 'bottom-mid',
        x: mid.x - tw / 2,
        y: mid.y + offset
      };
    case 'left':
      return {
        placement: 'left-mid',
        x: mid.x - tw - offset,
        y: mid.y - th / 2
      };
    case 'right':
      return {
        placement: 'right-mid',
        x: mid.x + offset,
        y: mid.y - th / 2
      };
  }
}

// 基于参考元素某一侧的边界来计算目标元素位置
function computeCoordinateBaseEdge(placementInfo, offset) {
  var placement = placementInfo.placement,
      start = placementInfo.start,
      end = placementInfo.end,
      dHor = placementInfo.dHor,
      dVer = placementInfo.dVer,
      tw = placementInfo.tw,
      th = placementInfo.th,
      ew = placementInfo.ew,
      eh = placementInfo.eh;

  var nearRight = dHor > 0;
  var nearBottom = dVer > 0;
  switch (placement) {
    case 'top':
      return {
        placement: nearRight ? 'top-end' : 'top-start',
        x: nearRight ? end.x - tw : start.x,
        y: start.y - th - offset,
        arrowsOffset: ew / 2
      };
    case 'bottom':
      return {
        placement: nearRight ? 'bottom-end' : 'bottom-start',
        x: nearRight ? end.x - tw : start.x,
        y: end.y + offset,
        arrowsOffset: ew / 2
      };
    case 'left':
      return {
        placement: nearBottom ? 'left-end' : 'left-start',
        x: start.x - tw - offset,
        y: nearBottom ? end.y - th : start.y,
        arrowsOffset: eh / 2
      };
    case 'right':
      return {
        placement: nearBottom ? 'right-end' : 'right-start',
        x: end.x + offset,
        y: nearBottom ? end.y - th : start.y,
        arrowsOffset: eh / 2
      };
  }
}

// ref 参考元素，container 容器， target 需要动态计算坐标的元素，limitQueue 限制展示方向
function computePlacementInfo(ref, container, target, limitQueue, offset) {
  if (!ref || !target) return;
  var placementQueue = limitQueue && limitQueue.length ? limitQueue : DEFAULT_PLACEMENT_QUEUE;

  var _getBoxMargin = getBoxMargin(ref, container),
      ew = _getBoxMargin.width,
      eh = _getBoxMargin.height,
      margin = _getBoxMargin.margin;

  var _target$getBoundingCl = target.getBoundingClientRect(),
      tw = _target$getBoundingCl.width,
      th = _target$getBoundingCl.height;

  var dw = (tw - ew) / 2;
  var dh = (th - eh) / 2;

  var queueLen = placementQueue.length;
  var processedQueue = Object.keys(margin).map(function (key) {
    var placementItem = margin[key];
    // 这里 index 可以用来标记显示方向的优先级 index 越大，优先级越高
    var index = placementQueue.indexOf(placementItem.placement);
    placementItem.weight = index > -1 ? MAX - index : MAX - queueLen;

    // 上下方向上可容纳目标元素
    var verSingleBiasCheck = ~VERTICAL.indexOf(placementItem.placement) && placementItem.size > th + offset;
    // 上下方向上可容纳目标元素 && 目标元素上下显示时左右也可完整显示目标元素
    var verFullBiasCheck = verSingleBiasCheck && margin.left.size > dw && margin.right.size > dw;
    // 左右方向上可容纳目标元素
    var horSingleBiasCheck = HORIZONTAL.indexOf(placementItem.placement) > -1 && placementItem.size > tw + offset;
    // 左右方向上可容纳目标元素 && 显示时上下也可完整显示目标元素
    var horFullBiasCheck = horSingleBiasCheck && margin.top.size > dh && margin.bottom.size > dh;
    // 竖直方向上的 top 与 bottom 的间距差值
    placementItem.dVer = margin.top.size - margin.bottom.size;
    // 水平方向上的 left 与 right 的间距差值
    placementItem.dHor = margin.left.size - margin.right.size;
    placementItem.mod = 'edge';

    if (verFullBiasCheck || horFullBiasCheck) {
      placementItem.mod = 'mid';
      placementItem.weight += 3 + placementItem.weight / MAX;
      return placementItem;
    }
    if (verSingleBiasCheck || horSingleBiasCheck) {
      placementItem.weight += 2 + placementItem.weight / MAX;
    }
    return placementItem;
  });
  return Object.assign({ ew: ew, eh: eh, tw: tw, th: th, dw: dw, dh: dh }, getBestPlacement(processedQueue));
}

// 用于计算小三角形在 tip 窗口中的位置
function computeArrowPos(placement, offset, size) {
  var start = offset + 'px';
  var end = offset - size * 2 + 'px';
  var posMap = {
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
  };
  return posMap[placement];
}

function debounce(fn, delay) {
  var timer = void 0;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

// 用于判断浏览器事件监听是否支持 passive 可参考：
// https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
// https://zhuanlan.zhihu.com/p/24555031
var supportsPassive = false;
document.addEventListener('passive-check', function () {}, {
  get passive() {
    supportsPassive = { passive: true };
  }
});

var main = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('transition', { attrs: { "name": "v-tip-fade" } }, [_c('div', { directives: [{ name: "show", rawName: "v-show", value: _vm.tipVisible, expression: "tipVisible" }], staticClass: "v-tip-container", class: _vm.boxClass, style: _vm.boxStyle, on: { "mouseenter": function mouseenter($event) {
          _vm.mouseEntered = true;
        }, "mouseleave": function mouseleave($event) {
          _vm.mouseEntered = false;
        } } }, [_c('div', { directives: [{ name: "show", rawName: "v-show", value: _vm.placement, expression: "placement" }], staticClass: "v-tip-arrows", class: _vm.placement, style: _vm.arrowBox }), _vm._v(" "), _vm.title ? _c('h4', { staticClass: "v-tip-title", domProps: { "textContent": _vm._s(_vm.title) } }) : _vm._e(), _vm._v(" "), _vm.content ? _c('p', { staticClass: "v-tip-content", style: _vm.contentHeight, domProps: { "textContent": _vm._s(_vm.content) } }) : _vm._e(), _vm._v(" "), _vm.customComponent ? _c(_vm.customComponent, _vm._g(_vm._b({ tag: "component", on: { "hidden": function hidden($event) {
          _vm.hiddenTip(true);
        } } }, 'component', _vm.customProps, false), _vm.customListeners)) : _vm._e(), _vm._v(" "), _vm._t("default")], 2)]);
  },
  staticRenderFns: [],
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
      default: function _default() {
        return {};
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
      default: function _default() {
        return ['top', 'right', 'bottom', 'left'];
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

  data: function data() {
    this.containerNode = null;
    this.targetParentNode = null;
    this.visibleTimer = null;
    return {
      // tip 的展示方向（小箭头的方向）
      placement: '',
      // 是否显示
      tipVisible: false,
      mouseEntered: false,
      arrowsPos: {}
    };
  },


  computed: {
    arrowBox: function arrowBox() {
      return Object.assign({
        borderWidth: this.arrowsSize + 'px'
      }, this.arrowsPos);
    },
    boxStyle: function boxStyle() {
      var width = this.width;
      return {
        width: typeof width === 'string' ? width : width + 'px',
        zIndex: this.zIndex
      };
    },
    boxClass: function boxClass() {
      var customClass = this.customClass,
          theme = this.theme,
          transition = this.transition;

      var tsClass = transition ? 'transition-transfrom' : '';
      return [customClass, theme, tsClass];
    },
    contentHeight: function contentHeight() {
      var height = this.height;
      return {
        height: typeof height === 'string' ? height : height + 'px'
      };
    }
  },

  watch: {
    mouseEntered: function mouseEntered(v) {
      if (!v) {
        this.setTipDurationVisible(false);
      }
    }
  },

  beforeDestroy: function beforeDestroy() {
    this.clearScrollEvent();
  },


  methods: {
    showTip: function showTip() {
      clearTimeout(this.visibleTimer);
      this.tipVisible = true;
    },


    // 隐藏 tip
    hiddenTip: function hiddenTip(immedia) {
      if (immedia) {
        this.tipVisible = false;
      } else {
        this.setTipDurationVisible(false);
      }
    },


    // 更新 tip 位置
    updateTip: function updateTip() {
      this.setContainerNode();
      this.showTip();
      this.asynSetCoordinate();
    },


    // 设置 tip 的容器
    setContainerNode: function setContainerNode() {
      var $el = this.$el,
          target = this.target,
          container = this.container,
          targetParentNode = this.targetParentNode,
          oldNode = this.containerNode;
      // 目标元素的父级节点相同则不需要重新计算容器

      if (!target || target.parentNode === targetParentNode) return;
      this.targetParentNode = target.parentNode;
      var newNode = container || getScrollContainer(target);
      if (newNode === oldNode) return;
      if ($el.parentNode !== newNode) {
        newNode.appendChild($el);
      }
      var position = window.getComputedStyle(newNode, null).position;
      if (!position || position === 'static') {
        newNode.style.position = 'relative';
      }
      if (oldNode) {
        oldNode.removeEventListener('scroll', this.scrollHandler, supportsPassive);
      }
      if (checkScrollable(newNode)) {
        newNode.addEventListener('scroll', this.scrollHandler, supportsPassive);
      }
      this.containerNode = newNode;
    },
    setCoordinate: function setCoordinate() {
      var $el = this.$el,
          target = this.target,
          containerNode = this.containerNode,
          placements = this.placements,
          arrowsSize = this.arrowsSize;

      if (!$el || !target || !containerNode) return;
      var placementInfo = computePlacementInfo(target, containerNode, $el, placements, arrowsSize);
      var coordinate = placementInfo.mod === 'mid' ? computeCoordinateBaseMid(placementInfo, arrowsSize) : computeCoordinateBaseEdge(placementInfo, arrowsSize);
      this.setArrowsPos(coordinate);
      this.placement = coordinate.placement;
      var x = coordinate.x + containerNode.scrollLeft;
      var y = coordinate.y + containerNode.scrollTop;
      this.$el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    },
    asynSetCoordinate: function asynSetCoordinate() {
      this.$nextTick(this.setCoordinate);
    },


    // 设置小三角形的位置
    setArrowsPos: function setArrowsPos(_ref) {
      var placement = _ref.placement,
          arrowsOffset = _ref.arrowsOffset;

      this.arrowsPos = computeArrowPos(placement, arrowsOffset, this.arrowsSize);
    },


    // 设置 tip 经过 duration ms 后的状态
    setTipDurationVisible: function setTipDurationVisible(v) {
      var _this = this;

      if (this.duration == null || this.duration <= 0) return;
      clearTimeout(this.visibleTimer);
      this.visibleTimer = setTimeout(function () {
        _this.tipVisible = v || _this.mouseEntered;
        _this.visibleTimer = null;
      }, this.duration);
    },


    // 参考元素父级容器发生滚动时的处理
    scrollHandler: debounce(function () {
      this.setCoordinate();
    }, 200),

    clearScrollEvent: function clearScrollEvent() {
      if (this.containerNode) {
        this.containerNode.removeEventListener('scroll', this.scrollHandler, supportsPassive);
      }
    }
  }
};

var VtipConstructor = Vue.extend(main);

var props = main.props;
var defaultOptions = {};
Object.keys(props).forEach(function (key) {
  var prop = props[key];
  var dv = prop.default;
  if (prop && prop.default != null) {
    defaultOptions[key] = typeof dv === 'function' ? dv() : dv;
  }
});

var vtipInstance = null;

function tip(options) {
  options = options || {};
  // 如果已经存在 tip 的实例,直接更新属性值
  if (vtipInstance) {
    Object.assign(vtipInstance, defaultOptions, options);
    if (vtipInstance.target) {
      vtipInstance.updateTip();
    } else {
      vtipInstance.hiddenTip();
    }
    return vtipInstance;
  }
  // 否则创建一个 tip 实例
  vtipInstance = new VtipConstructor({
    propsData: options
  }).$mount();
  vtipInstance.updateTip();
  return vtipInstance;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

function clearEvent(el) {
  if (el._tipHandler) {
    el.removeEventListener('click', el._tipHandler);
    el.removeEventListener('mouseenter', el._tipHandler);
  }
  if (el._tipMouseleaveHandler) {
    el.removeEventListener('mouseleave', el._tipMouseleaveHandler);
  }
  delete el._tipHandler;
  delete el._tipMouseleaveHandler;
  delete el._tipOptions;
  delete el._tipInstance;
}

var directive = {
  install: function install(Vue$$1, options) {
    options = options || {};
    // 自定义指令的名字，默认为 tip
    var name = options.directiveName || 'tip';
    // tip 的展示方向
    var allPlacement = ['top', 'right', 'bottom', 'left'];

    Vue$$1.directive(name, {
      bind: function bind(el, binding) {
        clearEvent(el);
        var _binding$modifiers = binding.modifiers,
            click = _binding$modifiers.click,
            dark = _binding$modifiers.dark,
            transition = _binding$modifiers.transition;

        var limitPlacementQueue = allPlacement.filter(function (placement) {
          return binding.modifiers[placement];
        });
        el._tipOptions = binding.value;
        el._tipHandler = function tipHandler() {
          if (this._tipOptions == null) return;
          var options = this._tipOptions;
          var placementQueue = limitPlacementQueue.length ? limitPlacementQueue : allPlacement;
          var mix = {
            placementQueue: placementQueue,
            transition: transition,
            theme: dark ? 'dark' : 'light'
            // 一般情况为 v-tip 绑定需要显示的内容
            // 需要配置时可以直接绑定一个配置对象
          };var tipOptions = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? Object.assign(mix, options, { target: this }) : Object.assign(mix, { content: String(options), target: this });
          this._tipInstance = tip(tipOptions);
        };
        el._tipMouseleaveHandler = function tipMouseleaveHandler() {
          if (this._tipInstance) {
            this._tipInstance.hiddenTip();
          }
        };
        // 默认触发方式为 hover 触发
        if (click) {
          el.addEventListener('click', el._tipHandler);
        } else {
          el.addEventListener('mouseenter', el._tipHandler);
        }
        el.addEventListener('mouseleave', el._tipMouseleaveHandler);
      },
      update: function update(el, _ref) {
        var value = _ref.value,
            oldValue = _ref.oldValue;

        if (value === oldValue) return;
        el._tipOptions = value;
      },
      unbind: function unbind(el) {
        var instance = el._tipInstance;
        if (instance && instance.clearScrollEvent) {
          instance.clearScrollEvent();
        }
        clearEvent(el);
      }
    });
  }
};

var index = { tip: tip, directive: directive };

export default index;
