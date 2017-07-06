<template>
  <div class="test">
    <input type="text" :value="name">
    <input type="text" :value="value">
  </div>
</template>

<script>
export default {
  name: 'content',

  props: {
    name: '',
    value: ''
  },

  methods: {
    fly () {
    }
  }
}
</script>

<style lang="scss">
.test {
  input, button {
    display: inline-block;
    height: 30px;
    line-height: 30px;
  }
}
</style>
