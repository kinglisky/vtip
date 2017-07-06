
// 获取视口的大小
function getClientView () {
  var vw = window.innerWidth || document.documentElement.clientWidth
  var vh = window.innerHeight || document.documentElement.clientHeight
  return {
    vw: vw,
    vh: vh
  }
}

// 获取页面中某个元素的位置信息
function getElementBox (el) {
  if (!el) return
  var rect = el.getBoundingClientRect()
  var clent = getClientView()
  var vw = clent.vw
  var vh = clent.vh

  var width = rect.width
  var height = rect.height

  var top = rect.top
  var right = rect.right
  var bottom = rect.bottom
  var left = rect.left

  var midX = left + width / 2
  var midY = top + height / 2
  return {
    width: width,
    height: height,
    // 距离视口各边的距离
    distance: {
      top: { direct: 'top', spacing: top, x: midX, y: top },
      right: { direct: 'right', spacing: vw - right, x: right, y: midY },
      bottom: { direct: 'bottom', spacing: vh - bottom, x: midX, y: bottom },
      left: { direct: 'left', spacing: left, x: left, y: midY }
    }
  }
}

// 获取一个元素最优的展示方向
function getBestCoordinate (el, target, limitDirects) {
  var directs = limitDirects
  if (!directs || !directs.length) {
    directs = ['top', 'right', 'bottom', 'left']
  }
  // tool-tip 对象
  var elBox = getElementBox(el)
  // 目标元素
  var targetBox = getElementBox(target)
  var targetDistance = targetBox.distance
    // 限制方向的队列
  var distanceQueue = directs.map(function (direct) {
    return targetDistance[direct]
  })
    // 可显示目标元素的方向队列
  var visibledistanceQueue = distanceQueue.filter(function (it) {
    var dx = elBox.width - targetBox.width
    var dy = elBox.height - targetBox.height
    if (~['top', 'bottom'].indexOf(it.direct)) {
      return it.spacing >= elBox.height &&
        [targetDistance.left, targetDistance.right].every(function (it) {
          return it.spacing > dx
        })
    }
    if (~['left', 'right'].indexOf(it.direct)) {
      return it.spacing >= elBox.width &&
        [targetDistance.top, targetDistance.bottom].every(function (it) {
          return it.spacing > dy
        })
    }
  })

  var bestDirect = visibledistanceQueue[0]
  bestDirect = bestDirect || distanceQueue.sort(function (a, b) {
    return b.spacing - a.spacing
  })[0]
  return {
    bestDirect: bestDirect,
    elBox: elBox,
    targetBox: targetBox
  }
}
export { getClientView, getElementBox, getBestCoordinate }
export default { getClientView, getElementBox, getBestCoordinate }
