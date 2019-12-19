<template>
  <div class="game-container">
    <div class="game-status">
      <div class="mine">
        <span>{{remainMine}}</span>
      </div>
      <div class="restart-btn" @click="restart">开始</div>
      <div class="time">
        <span>{{time}}</span>
      </div>
    </div>
    <div class="game">
      <p v-for="(square,ind) in squares" :key="ind">
        <span
          v-for="(item,index) in square"
          :key="index"
          @click="checkSquare({
        rowInd:ind,
        cellInd:index
      })"
          class="cell"
          @contextmenu.prevent="markMine({
             rowInd:ind,
        cellInd:index
          })"
          @dblclick="checkAroundSquare({
            rowInd:ind,
        cellInd:index
          })"
        >
          <span v-if="item.mineMark && !item.isChecked">
            <img src="/imgs/mark.png" alt />
          </span>

          <span v-else-if="!item.isChecked"></span>
          <span v-else-if="item.isMine && item.isChecked" class="is-checked">
            <img src="/imgs/boom.png" alt />
          </span>
          <span v-else-if="item.isMine">
            <img src="/imgs/mine.png" alt />
          </span>
          <span class="is-checked" v-else>{{item.mineCount || ''}}</span>
        </span>
      </p>
    </div>
    <p class="tip">*双击可快速排除</p>
  </div>
</template>
<script>
class Square {
  constructor() {
    this.isMine = false //是否为地雷
    this.mineCount = 0 //显示的地雷数目 当isMine为true时候 该项目无效
    this.mineMark = false //是否标记为地雷
    this.isChecked = false //是否已打开
  }

}

class SquarePoint {
  constructor(rowInd,cellInd) {
    this.rowInd = rowInd //纵坐标
    this.cellInd = cellInd //横坐标
  }
}
export default {
  name:'Game',
  // props:{
  //   rowSize:Number,
  //   cellSize:Number,
  //   mineCount:Number
  // },
  data() {
    return {
      rowSize:20,
      cellSize:20,
      mineCount:50,

      markCount:0,
      curMineCount:0,
      squares:[],  
      time:0,
      timer:null,
      checkCount:0

     
    }
  },
  computed:{
    remainMine() {
      return this.mineCount - this.markCount >0?this.mineCount - this.markCount:0
    }
    
  },
  watch:{
    checkCount(curVal) {
      if(curVal === this.rowSize * this.cellSize - this.mineCount) {
        this.gameFinish()
      }
    }

  },
  created() {
    this.initGame()
  },
  methods:{
    restart() {
      this.reset()

      this.start()
    },
    reset() {
      clearInterval(this.timer)
      this.markCount=0,
      this.curMineCount=0,
      this.squares=[],  
      this.time=0,
      this.timer=null,
      this.checkCount=0

      this.initGame()
    },
    gameFinish() {
      alert('游戏完成')
    },
    //玩家标记
    markMine(square) {
      const obj =  this.getSquare(square)
      if(obj.isChecked) {
        return
      }
      obj.mineMark = !this.getSquare(square).mineMark
    },
    //比较两个是否为同一方格
    compare(a,b) {
      return a.rowInd === b.rowInd && a.cellInd === b.rowInd
    },
    initGame() {
      this.initSquares()
      this.getRandomMine()
      this.calculateCount()
    },
    start() {
      this.timer = setInterval(()=>{
        this.time++
      },1000)
    },
    //初始化雷的数目
    calculateCount() {
      this.squares.forEach((el,index) => {
        el.forEach((ele,ind)=>{
          this.getMineCount(new SquarePoint(index,ind))
        })
      })
    },
    //初始化方格二维数组
    initSquares() {
      const self = this
      this.squares = Array.apply(null, new Array(this.rowSize)).map(() => {
        return  Array.apply(null, new Array(this.rowSize)).map(() => {
          return new Proxy(new Square(),{
            set:function(target,key,value,receiver) {
              if(key === 'mineMark') {
                if(target[key] && !value) {
                  self.markCount--
                }
                if(!target[key] && value) {
                  self.markCount++
                }
              }
              if(key === 'isChecked') {
                if(!target[key] && value) {
                  self.checkCount++
                }
              }
              return Reflect.set(target, key, value, receiver)
            }
          })
        })
      })
    },
    //点击时显示周边空白方格
    spreadEmptySquare(point) {
      const isComputed = {}//用于记录已计算的方格
      isComputed[point.rowInd] = [point.cellInd]
      const checkAround = (squares) =>{

        let nextSquares = []

        const {rowInd,cellInd} = squares
    
        let around = [[rowInd -1,cellInd],
          [rowInd -1,cellInd-1],
          [rowInd -1,cellInd+1],
          [rowInd,cellInd-1],
          [rowInd,cellInd+1],
          [rowInd+1,cellInd],
          [rowInd+1,cellInd-1],
          [rowInd+1,cellInd+1]]
        around= around.filter(item => {

          return item[0]>=0 && item[0]<this.rowSize && item[1]>=0 && item[1]<this.cellSize && !(isComputed[item[0]] && isComputed[item[0]].indexOf(item[1])>-1)
        })
        for(let el of around) {
          isComputed[el[0]]?isComputed[el[0]].push(el[1]):isComputed[el[0]]= [el[1]]
            
          const square =new SquarePoint(el[0],el[1]), obj = this.getSquare(square)
          if(obj.mineCount === 0) {
            nextSquares.push(square)
          }

          obj.isChecked = true
        }
        if(nextSquares.length === 0) {
          nextSquares = null
        }
        return nextSquares
      }
      
      let stack = checkAround(point) || []
      while(stack.length > 0) {
        let temp = checkAround(stack.pop())
        console.log(temp)
        if(temp) {
          stack = stack.concat(temp)
        }
      }
   
    },
    //获取周边的格子，用于计算雷数目以及快捷排除
    getAroundSquare({rowInd,cellInd}) {

      const around = [],rowIndexs = [rowInd-1,rowInd,rowInd+1].filter(item => item>=0),cellIndexs = [cellInd-1,cellInd,cellInd+1].filter(item => item>=0)
      rowIndexs.forEach(el => {
        if(el<0||el >= this.rowSize) {
          return true
        }
        cellIndexs.forEach(ele => {
          if(ele < 0 || ele >= this.cellSize ) {
            return true
          }
          if(el === rowInd && ele === cellInd) {
            return true
          }
          around.push(new SquarePoint(el,ele))
        })
      })
      return around
    },
    //获取周围雷的数目
    getMineCount(square) {
      const squareObj = this.getSquare(square)
      if(squareObj.isMine) {
        return
      }
      squareObj.mineCount = this.getAroundSquare(square).map(item => this.getSquare(item)).filter(item => item.isMine).length
    },
    //获取随机的雷
    getRandomMine() {
      this.getRandomSquarePoint(this.mineCount).forEach(el => {
        this.getSquare(el).isMine = true
      })
    },
    //点击格子的行为，在快捷排除时候同样使用
    checkSquare(square) {
      const squareObj = this.getSquare(square)
      if(squareObj.mineMark || squareObj.isChecked) {
        return
      }

      squareObj.isChecked = true

      if(squareObj.isMine) {
        return this.gameover()
      }
      if(squareObj.mineCount === 0) {
        return this.spreadEmptySquare(square)
      }
    },
    //快捷排除
    checkAroundSquare(square) {
      const arounds =  this.getAroundSquare(square),isMarkArounds=arounds.map(item => this.getSquare(item)).filter(item=>item.mineMark),notCheckedArounds=arounds.filter(item => !this.getSquare(item).isChecked)
      if(notCheckedArounds.length === this.getSquare(square).mineCount) {
        return
      }
      if(isMarkArounds.length === this.getSquare(square).mineCount) {
        notCheckedArounds.forEach(el => {
          this.checkSquare(el)
        })
      }

    },
    //由坐标对象获取方格对象
    getSquare(point) {
      return  this.squares[point.rowInd][point.cellInd]
    },
    gameover() {
      alert('game over')
      // this.reset()
    },
    //获取随机的方格，不可重复及超出界限
    getRandomSquarePoint(count) {
      const results = [],checkMap={}
      while(count-- >0) {
        let rowInd =Math.round(Math.random()*(this.rowSize -1 )),cellInd =  Math.round(Math.random()*(this.cellSize-1))
        while(checkMap[rowInd] && checkMap[rowInd].indexOf(cellInd) > -1 ) {
          cellInd =  Math.round(Math.random()*(this.cellSize-1))
        }
        checkMap[rowInd]? checkMap[rowInd].push(cellInd):checkMap[rowInd]=[cellInd]
        results.push(new SquarePoint(rowInd,cellInd))
      }
      return results
    }
  }
}
</script>
<style lang="scss" scoped>
$cell-length: 30px;

.game-container {
  .game-status {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    > * {
      height: 30px;
      width: 40px;
      line-height: 30px;
      border: 1px solid #333333;
      text-align: center;
    }
    .restart-btn {
      cursor: pointer;
    }
  }
  .game {
    border: 1px solid #333333;
    border-width: 1px 1px 0 0;
    * {
      cursor: default;
      user-select: none;
    }
    p {
      margin: 0;
      padding: 0;
      display: flex;
      .cell {
        width: $cell-length;
        height: $cell-length;
        border: 1px solid #333333;
        border-width: 0 0 1px 1px;
        box-sizing: border-box;
        text-align: center;
        line-height: $cell-length;
        img {
          width: $cell-length - 5px;
          height: $cell-length - 5px;
        }
        .is-checked {
          height: calc(100% - 1px);
          width: calc(100% - 1px);
          display: inline-block;
          background-color: #eeeeee;
          color: blue;
        }
      }
    }
  }
  .tip {
    font-size: 14px;
    line-height: 32px;
  }
}
</style>