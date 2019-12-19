<template>
  <div class="start">
    <h1>扫雷</h1>
    <ul class="menu">
      <li>开始游戏</li>
    </ul>
  </div>
</template>
<script>
export default {
  name:'Start'
}
</script>
<style lang="scss" scoped>
.start {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;

  h1 {
    text-align: center;

    font-weight: bold;
    font-size: 24px;
  }
  .menu {
    text-align: center;

    font-size: 16px;
    li {
      cursor: pointer;
    }
  }
}
</style>