<template>
  <div class="home">
    <div class="content-container">
      <Game></Game>
    </div>
  </div>
</template>

<script>
import Game from '@/components/Game'
export default {
  name: 'home',
  components:{
    Game
  }
}
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  .content-container {
    width: 1200px;
    height: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
