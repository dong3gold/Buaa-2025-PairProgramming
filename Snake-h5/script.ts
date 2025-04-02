interface Point {
    x: number;
    y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

function numberToDirection(num: number): Direction {
    switch (num) {
        case 0: return 'up';
        case 1: return 'left';
        case 2: return 'down';
        case 3: return 'right';
        default: return 'up'; // 默认返回上
    }
}

export function getNextMove(snake: Point[], food: Point, obstacles: Point[], curDirection: Direction, gridSize: number): Direction {
    return wrap(snake, food, obstacles, curDirection, gridSize, greedy_snake_move_barriers);
}

function wrap(snake: Point[], food: Point, obstacles: Point[], curDirection: Direction, gridSize: number, moveFunc: Function): Direction {
    let _snake: number[] = [];
    for (let i = 0; i < snake.length; i++) {
        _snake.push(snake[i].x);
        _snake.push(snake[i].y);
    }
    let _food = [food.x, food.y];
    let _obstacles: number[] = [];
    for (let i = 0; i < obstacles.length; i++) {
        _obstacles.push(obstacles[i].x);
        _obstacles.push(obstacles[i].y);
    }
    return numberToDirection(moveFunc(_snake, _food, _obstacles));
}

function exampleMove(snake: number[], food: number[]) {
    return 'up';
}

function oppositeDirection(dir: Direction): Direction {
    switch (dir) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
    }
}


function my_greedy_movefunction(snake: Point[], food: Point, curDirection: Direction, gridSize: number): Direction {
    const head = snake[0];
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    let nextDirection = curDirection;
    if (dx != 0 && (dy == 0 || (curDirection == 'right' || curDirection == 'left'))) {
        nextDirection = dx > 0 ? "right" : "left";
        if (oppositeDirection(curDirection) !== nextDirection) {
            return nextDirection;
        } else {
            return dy > 0 ? "down" : "up";
        }
    } else {
        nextDirection = dy > 0 ? "down" : "up";
        if (oppositeDirection(curDirection) !== nextDirection) {
            return nextDirection;
        } else {
            return dx > 0 ? "right" : "left";
        }
    }

}

type i32 = number;
type bool = boolean;
// 记录当前路径的方向序列
let pathDirections: i32[] = [];

export function greedy_snake_move_barriers(
  snake: i32[],
  fruit: i32[],
  barriers: i32[]
): i32 {
  const headX = snake[0];
  const headY = snake[1];
  const fruitX = fruit[0];
  const fruitY = fruit[1];

  // 使用Set存储障碍物坐标
  const barrierSet = new Set<string>();
  for (let i = 0; i < barriers.length; i += 2) {

  // 通过字符串来去重，（使用class会出现引用问题）
    const barrierKey = `${barriers[i]},${barriers[i + 1]}`;
    barrierSet.add(barrierKey);
  }

  // 获取下一步
  const dir = computePath(snake, fruit, barrierSet);
  return dir;
}

// BFS计算路径方向序列
function computePath(
  snake: i32[],
  fruit: i32[],
  barriers: Set<string>
): i32{
  const headX = snake[0];
  const headY = snake[1];
  const fruitX = fruit[0];
  const fruitY = fruit[1];
  const curDir = getCurrentDirection(snake);

  // BFS 队列
  const queue: i32[] = [headX, headY, curDir];
  const visited = new Set<string>();
  const prevDir = new Map<string, string>();

  visited.add(`${headX},${headY},${curDir}`);

  while (queue.length >= 2) {
    const x = queue.shift()!;
    const y = queue.shift()!;
    const dir = queue.shift()!;

    // 找到，则返回路径
    if (x === fruitX && y === fruitY) {
      return buildPath(prevDir, x, y);
    }

    // 方向数组
    const directions = [
      [x, y + 1, 0], // 上（0）
      [x - 1, y, 1], // 左（1）
      [x, y - 1, 2], // 下（2）
      [x + 1, y, 3]  // 右（3）
    ];

    const p = `${x},${y},${dir}`;

    for (let i = 0; i < directions.length; i++) {
      if (getOppositeDirection(dir) === i) {
        continue;
      }
      const nx = directions[i][0];
      const ny = directions[i][1];
      const ndir = directions[i][2];
      const key = `${nx},${ny},${ndir}`;
      const pos = `${nx},${ny}`;
      if (nx >= 1 && nx <= 8 &&
          ny >= 1 && ny <= 8 &&
          !visited.has(key) &&
          !barriers.has(pos)
      ) {
        visited.add(key);
        queue.push(nx);
        queue.push(ny);
        queue.push(ndir);
        prevDir.set(key, p); // 设置前驱
      }
    }
  }

  return -1;
}

// 利用map, 生成方向序列
function buildPath(
  prevDir: Map<string, string>,
  x: i32,
  y: i32
): i32 {
  const path: i32[] = [];
  let currentX = x;
  let currentY = y;
  let dir = 0;

  for (dir = 0; dir < 4; dir++) {
    if (prevDir.has(`${currentX},${currentY},${dir}`)) {
      break;
    }
  }
  if (dir === 4) {
    return -1;
  }

  let p = `${currentX},${currentY},${dir}`;
  let n = "";
  while (prevDir.has(p)) { // -1 为初始节点
    n = p;
    p = prevDir.get(p)!;
  }
  return <i32>parseInt(n.slice(n.length - 1, n.length))
}

// 辅助函数：判断是否是蛇身
// function isSnakeBody(x: i32, y: i32, snake: i32[]): boolean {
//   for (let i = 0; i < snake.length; i += 2) {
//     if (snake[i] === x && snake[i + 1] === y) {
//       return true;
//     }
//   }
//   return false;
// }

// 辅助函数：获取当前方向
function getCurrentDirection(snake: i32[]): i32 {
  const headX = snake[0];
  const headY = snake[1];
  const bodyX = snake[2];
  const bodyY = snake[3];

  if (headX > bodyX) return 3; // 右
  if (headX < bodyX) return 1; // 左
  if (headY > bodyY) return 0; // 上
  if (headY < bodyY) return 2; // 下
  return 0;
}

// 获取相反方向
function getOppositeDirection(dir: i32): i32 {
  switch (dir) {
    case 0: return 2;
    case 1: return 3;
    case 2: return 0;
    case 3: return 1;
    default: return 0;
  }
}