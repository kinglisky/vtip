<template>
  <div :style="{ width: '330px', height: '86px' }">
    <iframe
      frameborder="no" border="0"
      marginwidth="0" marginheight="0"
      width=330 height=86 :src="link">
    </iframe>
  </div>
</template>

<script>
import musics from './musics.js'

export default {
  props: {
    id: String
  },

  computed: {
    link () {
      return `//music.163.com/outchain/player?type=2&id=${this.id}&auto=1&height=66`
    }
  }
}
</script>



