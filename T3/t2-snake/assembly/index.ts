// 记录当前路径的方向序列
let pathDirections: i32[] = [];

// random.ts

// 线性同余生成器类
class LCG {
  private seed: u32;

  constructor(seed: u32) {
    this.seed = seed;
  }

  // 线性同余算法
  next(): u32 {
    // 使用常见的 LCG 参数 (a, c, m)
    this.seed = <u32>((1664525 * this.seed + 1013904223) % 4294967296);
    return this.seed;
  }

  // 生成 0 到 1 之间的浮点数
  nextFloat(): f64 {
    return this.next() / 4294967296.0;
  }

  // 生成指定范围的整数 [min, max]
  nextInt(min: i32, max: i32): i32 {
    const range = max - min + 1;
    return min + i32(this.next() % u32(range));
  }
}

// 导出函数
let _rng = new LCG(123456789); // 默认种子

// 设置种子
function seed(s: u32): void {
  _rng = new LCG(s);
}

// 获取随机 u32
function random(): u32 {
  return _rng.next();
}

// 获取 0-1 之间的随机浮点数
function randomFloat(): f64 {
  return _rng.nextFloat();
}

// 获取指定范围的随机整数 [min, max]
function randomInt(min: i32, max: i32): i32 {
  return _rng.nextInt(min, max);
}

let foodX = -1, foodY = -1;

function hasFood(x: i32, y: i32, foodNum: i32, foods: i32[]): bool {
  for (let i = 0; i < foodNum; i++) {
    if (foods[i * 2] === x && foods[i * 2 + 1] === y) {
      return true;
    }
  }
  return false;
}

export function greedy_snake_step(
  n: i32,
  snake: i32[],
  snakeNum: i32,
  otherSnake: i32[],
  foodNum: i32,
  foods: i32[],
  round: i32
): i32 {
  if (foodX === -1 || foodY === -1 || !hasFood(foodX, foodY, foodNum, foods)) {
    let _foodIdx = randomInt(0, foodNum - 1);
    foodX = foods[_foodIdx * 2];
    foodY = foods[_foodIdx * 2 + 1];
  }

  let barriers: i32[] = [];

  for (let i = 0; i < snakeNum; i++) {
    barriers.push(otherSnake[i * 8]);
    barriers.push(otherSnake[i * 8 + 1]);
    barriers.push(otherSnake[i * 8 + 2]);
    barriers.push(otherSnake[i * 8 + 3]);
    barriers.push(otherSnake[i * 8 + 4]);
    barriers.push(otherSnake[i * 8 + 5]);
  }

  let res = greedy_snake_move_barriers(snake, [foodX, foodY], barriers);
  return res;
}


function greedy_snake_move_barriers(
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
): i32 {
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

  while (queue.length >= 3) {
    const x = queue.shift();
    const y = queue.shift();
    const dir = queue.shift();

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
        !barriers.has(pos)) 
      {
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
    p = prevDir.get(p);
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