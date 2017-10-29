const OVERFLOW_PROPERTYS = ['overflow', 'overflow-x', 'overflow-y']

const SCROLL_TYPES = ['scroll', 'auto']

// 根元素
const ROOT = document.body

// 竖直方向
const VERTICAL = ['top', 'bottom']
// 水平方向
const HORIZONTAL = ['left', 'right']

// 默认限制显示方向如下，显示优先级按顺序以此递减
const DEFAULT_PLACEMENT_QUEUE = ['top', 'right', 'bottom', 'left']

// 最大值
const MAX = 4

// 获取目标元素相对于参考容器的位置信息
function getBoxMargin (el, parent) {
  if (!el) return
  const eBox = el.getBoundingClientRect()
  const pBox = parent.getBoundingClientRect()

  const { width: vw, height: vh } = pBox
  const { width, height } = eBox

  const top = eBox.top - pBox.top
  const left = eBox.left - pBox.left
  const right = eBox.right - pBox.left
  const bottom = eBox.bottom - pBox.top

  const midX = left + width / 2
  const midY = top + height / 2

  // 目标的顶点坐标 [top-left, top-right, bottom-right, botton-left]
  const vertex = {
    tl: { x: left, y: top },
    tr: { x: right, y: top },
    br: { x: right, y: bottom },
    bl: { x: left, y: bottom }
  }

  return {
    width,
    height,
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
  }
}

// 获取最优展示方向，weight 越大对应方向的优先级越高
function getBestPlacement (queue) {
  return queue.sort((a, b) => b.weight - a.weight)[0]
}

// 是否是个可滚动的元素
export function checkScrollable (element) {
  const css = window.getComputedStyle(element, null)
  return OVERFLOW_PROPERTYS.some(property => {
    return ~SCROLL_TYPES.indexOf(css[property])
  })
}

// 获取参考元素第一个可滚动的元素
export function getScrollContainer (el) {
  if (!el) return ROOT
  let parent = el.parentNode
  while (parent && parent !== ROOT) {
    if (checkScrollable(parent)) {
      return parent
    }
    parent = parent.parentNode
  }
  return ROOT
}

// 基于参考元素的某一侧的中点来计算目标元素的坐标
export function computeCoordinateBaseMid (placementInfo, offset) {
  const { placement, mid, tw, th } = placementInfo
  switch (placement) {
    case 'top': return {
      placement: 'top-mid',
      x: mid.x - tw / 2,
      y: mid.y - th - offset
    }
    case 'bottom': return {
      placement: 'bottom-mid',
      x: mid.x - tw / 2,
      y: mid.y + offset
    }
    case 'left': return {
      placement: 'left-mid',
      x: mid.x - tw - offset,
      y: mid.y - th / 2
    }
    case 'right': return {
      placement: 'right-mid',
      x: mid.x + offset,
      y: mid.y - th / 2
    }
  }
}

// 基于参考元素某一侧的边界来计算目标元素位置
export function computeCoordinateBaseEdge (placementInfo, offset) {
  const { placement, start, end, dHor, dVer, tw, th, ew, eh } = placementInfo
  const nearRight = dHor > 0
  const nearBottom = dVer > 0
  switch (placement) {
    case 'top': return {
      placement: nearRight ? 'top-end' : 'top-start',
      x: nearRight ? end.x - tw : start.x,
      y: start.y - th - offset,
      arrowsOffset: ew / 2
    }
    case 'bottom': return {
      placement: nearRight ? 'bottom-end' : 'bottom-start',
      x: nearRight ? end.x - tw : start.x,
      y: end.y + offset,
      arrowsOffset: ew / 2
    }
    case 'left': return {
      placement: nearBottom ? 'left-end' : 'left-start',
      x: start.x - tw - offset,
      y: nearBottom ? end.y - th : start.y,
      arrowsOffset: eh / 2
    }
    case 'right': return {
      placement: nearBottom ? 'right-end' : 'right-start',
      x: end.x + offset,
      y: nearBottom ? end.y - th : start.y,
      arrowsOffset: eh / 2
    }
  }
}

// ref 参考元素，container 容器， target 需要动态计算坐标的元素，limitQueue 限制展示方向
export function computePlacementInfo (ref, container, target, limitQueue, offset) {
  if (!ref || !target) return
  const placementQueue = limitQueue && limitQueue.length
    ? limitQueue : DEFAULT_PLACEMENT_QUEUE
  const { width: ew, height: eh, margin } = getBoxMargin(ref, container)
  const { width: tw, height: th } = target.getBoundingClientRect()

  const dw = (tw - ew) / 2
  const dh = (th - eh) / 2

  const queueLen = placementQueue.length
  const processedQueue = Object.keys(margin)
    .map(key => {
      const placementItem = margin[key]
      // 这里 index 可以用来标记显示方向的优先级 index 越大，优先级越高
      const index = placementQueue.indexOf(placementItem.placement)
      placementItem.weight = index > -1 ? MAX - index : MAX - queueLen

      // 上下方向上可容纳目标元素
      const verSingleBiasCheck = (
        ~VERTICAL.indexOf(placementItem.placement) &&
        placementItem.size > th + offset
      )
      // 上下方向上可容纳目标元素 && 目标元素上下显示时左右也可完整显示目标元素
      const verFullBiasCheck = (
        verSingleBiasCheck &&
        margin.left.size > dw &&
        margin.right.size > dw
      )
      // 左右方向上可容纳目标元素
      const horSingleBiasCheck = (
        HORIZONTAL.indexOf(placementItem.placement) > -1 &&
        placementItem.size > tw + offset
      )
      // 左右方向上可容纳目标元素 && 显示时上下也可完整显示目标元素
      const horFullBiasCheck = (
        horSingleBiasCheck &&
        margin.top.size > dh &&
        margin.bottom.size > dh
      )
      // 竖直方向上的 top 与 bottom 的间距差值
      placementItem.dVer = margin.top.size - margin.bottom.size
      // 水平方向上的 left 与 right 的间距差值
      placementItem.dHor = margin.left.size - margin.right.size
      placementItem.mod = 'edge'

      if (verFullBiasCheck || horFullBiasCheck) {
        placementItem.mod = 'mid'
        placementItem.weight += 3 + placementItem.weight / MAX
        return placementItem
      }
      if (verSingleBiasCheck || horSingleBiasCheck) {
        placementItem.weight += 2 + placementItem.weight / MAX
      }
      return placementItem
    })
  return Object.assign({ ew, eh, tw, th, dw, dh }, getBestPlacement(processedQueue))
}

// 用于计算小三角形在 tip 窗口中的位置
export function computeArrowPos (placement, offset, size) {
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

export function debounce (fn, delay) {
  let timer
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}
