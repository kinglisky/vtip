// 获取视口的大小
function getClientView () {
  return {
    vw: window.innerWidth || document.documentElement.clientWidth,
    vh: window.innerHeight || document.documentElement.clientHeight
  }
}

// 获取目标元素距离各个边界的位置信息
function getBoxMargin (el) {
  if (!el) return
  const box = el.getBoundingClientRect()

  const { vw, vh } = getClientView()

  const { width, height, top, right, bottom, left } = box

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

// 默认限制显示方向如下，显示优先级按顺序以此递减
const DEFAULT_PLACEMENT_QUEUE = ['top', 'right', 'bottom', 'left']
// 竖直方向
const VERTICAL = ['top', 'bottom']
// 水平方向
const HORIZONTAL = ['left', 'right']

// 最大值
const MAX = 4

// 获取最优展示方向，index 越小对应方向的优先级越高
function getBestMargin (queue) {
  return queue.length === 1
    ? queue[0]
    : queue.sort((a, b) => a.index - b.index)[0]
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

// el 参考元素，target 需要动态计算坐标的元素，limitQueue 限制展示方向
export function computePlacementInfo (el, target, limitQueue) {
  if (!el || !target) return
  const placementQueue = Array.isArray(limitQueue) && limitQueue.length
    ? limitQueue : DEFAULT_PLACEMENT_QUEUE

  const { width: ew, height: eh, margin } = getBoxMargin(el)
  const { width: tw, height: th } = target.getBoundingClientRect()

  const dw = (tw - ew) / 2
  const dh = (th - eh) / 2

  // 用于储存单个（水平或竖直）方向可容纳目标元素的方向
  const singleAdmitQueue = []
  // 用于储存水平或竖直方向上都可容纳目标元素的方向
  const fullAdmitQueue = []
  const marginQueue = Object.keys(margin)
    .map(key => {
      const placementItem = margin[key]
      const index = placementQueue.indexOf(placementItem.placement)
      placementItem.index = index > -1 ? index : MAX
      // 上下间距校验单方向校验
      const verSingleBiasCheck = (
        VERTICAL.indexOf(placementItem.placement) > -1 &&
        placementItem.size > th
      )
      // 上下间距校验双方向校验
      const verFullBiasCheck = (
        verSingleBiasCheck &&
        margin.left.size > dw &&
        margin.right.size > dw
      )
      // 左右间距校验单方向校验
      const horSingleBiasCheck = (
        HORIZONTAL.indexOf(placementItem.placement) > -1 &&
        placementItem.size > tw
      )
      // 左右间距校验双方向校验
      const horFullBiasCheck = (
        horSingleBiasCheck &&
        margin.top.size > dh &&
        margin.bottom.size > dh
      )
      // 竖直方向上的 top 与 bottom 的间距差值
      placementItem.dVer = margin.top.size - margin.bottom.size
      // 水平方向上的 left 与 right 的间距差值
      placementItem.dHor = margin.left.size - margin.right.size
      if (verSingleBiasCheck || horSingleBiasCheck) {
        singleAdmitQueue.push(placementItem)
      }
      if (verFullBiasCheck || horFullBiasCheck) {
        fullAdmitQueue.push(placementItem)
      }
    })
  const mix = { ew, eh, tw, th, dw, dh }
  if (fullAdmitQueue.length) {
    return Object.assign({ mod: 'mid' }, mix, getBestMargin(fullAdmitQueue))
  }
  if (singleAdmitQueue.length) {
    return Object.assign({ mod: 'edge' }, mix, getBestMargin(singleAdmitQueue))
  }
  const maxMargin = marginQueue.sort((a, b) => b.size - a.size)[0]
  return Object.assign({ mod: 'edge' }, mix, maxMargin)
}

export default { getClientView, computePlacementInfo, computeCoordinateBaseMid, computeCoordinateBaseEdge }
