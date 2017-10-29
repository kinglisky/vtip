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
const MUSIC_MAP = {}
musics.forEach(it => {
  MUSIC_MAP[it.name] = it.id
})

export default {
  props: {
    name: String
  },

  computed: {
    link () {
      const id = MUSIC_MAP[this.name]
      return `//music.163.com/outchain/player?type=2&id=${id}&auto=0&height=66`
    }
  }
}
</script>



