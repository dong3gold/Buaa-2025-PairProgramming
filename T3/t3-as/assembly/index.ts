// 记录当前路径的方向序列
let pathDirections: i32[] = [];

let mapSize = 8; // 地图大小
// 记录每个位置蛇的可能到达情况
let snakeReachable: StaticArray<i32> | null = null;
let visMap: StaticArray<i32> | null = null;
let safeDirs: StaticArray<bool> = new StaticArray<bool>(4);

// 食物权重，食物权重半径，自由权重（待办），危险权重
const foodWeight = 5, foodWeightRaduis = 2, freedomWeight = 10, dangerWeight = 6;

export function greedy_snake_step(
  n: i32,
  snake: i32[],
  snakeNum: i32,
  otherSnake: i32[],
  foodNum: i32,
  foods: i32[],
  round: i32
): i32 {

  // 初始化全局变量
  if (snakeReachable === null || visMap === null || mapSize !== n) {
    mapSize = n;
    snakeReachable = new StaticArray<i32>(mapSize * mapSize);
    visMap = new StaticArray<i32>(mapSize * mapSize * 4);
  }


  let curDirection = getCurrentDirection(snake);
  let curX = snake[0];
  let curY = snake[1];

  // 计算当前蛇的可达性
  getSafeDirection(snake, otherSnake, safeDirs);


  computeAllReachable(snakeNum, otherSnake, snakeReachable!, visMap!, 2);

  const directions = [
    [0, 1], // 上（0）
    [-1, 0], // 左（1）
    [0, -1], // 下（2）
    [1, 0]   // 右（3）
  ];

  let weights = new StaticArray<f64>(4);
  let maxWeight: f64 = -1;
  let bestDir = curDirection;

  // 分别计算四个方向的权重
  for (let dir = 0; dir < 4; dir++) {
    if (!safeDirs[dir]) {
      weights[dir] = -1;
      continue;
    }
    const newX = curX + directions[dir][0];
    const newY = curY + directions[dir][1];

    const foodWeight = getFoodWeights(newX, newY, foodNum, foods);
    const dangerWeight = getDangerWeight(newX, newY, snakeReachable!);
    const weight = foodWeight - dangerWeight + freedomWeight;
    weights[dir] = weight;
    if (weight > maxWeight) {
      maxWeight = weight;
      bestDir = dir;
    }
  }

  return bestDir;
}

function cleanSnakeReachable(snakeReachable: StaticArray<i32>): void {
  snakeReachable.fill(-1);
}


// BFS计算可达性（没有障碍，要求传入蛇头坐标要减1）
function computeReachable(
  headX: i32,
  headY: i32,
  curDir: i32,
  steps: i32,
  snakeReachable: StaticArray<i32>,
  visMap: StaticArray<i32>,
): void {
  visMap.fill(0);

  // BFS 队列
  const queue: i32[] = [headX, headY, curDir, 0];
  visMap[(headX * mapSize + headY) * 4 + curDir] = 1;
  snakeReachable[(headX * mapSize + headY)] = 0;

  while (queue.length >= 2) {
    const x = queue.shift();
    const y = queue.shift();
    const dir = queue.shift();
    const step = queue.shift();
    if (step > steps) {
      continue;
    }

    // 方向数组
    const directions = [
      [x, y + 1, 0], // 上（0）
      [x - 1, y, 1], // 左（1）
      [x, y - 1, 2], // 下（2）
      [x + 1, y, 3]  // 右（3）
    ];

    for (let i = 0; i < directions.length; i++) {
      if (i == getOppositeDirection(dir))
        continue;
      const nx = directions[i][0];
      const ny = directions[i][1];
      const ndir = directions[i][2];
      const loc = (nx * mapSize + ny);
      if (nx >= 0 && nx < 8 &&
        ny >= 0 && ny < 8 &&
        visMap[(loc * 4 + ndir)] == 0
      ) {
        visMap[(loc * 4 + ndir)] = step + 1;
        queue.push(nx);
        queue.push(ny);
        queue.push(ndir);
        queue.push(step + 1);
        snakeReachable[loc] = snakeReachable[loc] == -1 ? step + 1 : min(snakeReachable[loc], step + 1);
      }
    }
  }
}

// 计算除当前蛇外的所有蛇的可达性（即危险位置）
function computeAllReachable(snakeNum: i32, otherSnakes: i32[], snakeReachable: StaticArray<i32>,
  visMap: StaticArray<i32>, steps: i32
): void {
  cleanSnakeReachable(snakeReachable);
  for (let i = 0; i < snakeNum; i++) {
    const otherX = otherSnakes[i * 8];
    const otherY = otherSnakes[i * 8 + 1];
    const otherDir = getCurrentDirectionByXY(otherX, otherY, otherSnakes[i * 8 + 2], otherSnakes[i * 8 + 3]);
    computeReachable(otherX - 1, otherY - 1, otherDir, steps, snakeReachable, visMap);
  }
}

// 计算全部食物对x,y的权重
function getFoodWeights(x: i32, y: i32, foodNum: i32, foods: i32[]): f64 {
  let ans: f64 = 0;
  for (let i = 0; i < foodNum; i++) {
    const foodX = foods[i * 2];
    const foodY = foods[i * 2 + 1];
    ans += foodWeightFunc(foodX, foodY, x, y);
  }
  return ans;
}

// 计算单个食物对x,y的权重
function foodWeightFunc(foodX: i32, foodY: i32, x: i32, y: i32): f64 {
  const dx = foodX - x;
  const dy = foodY - y;
  const distance = dx * dx + dy * dy;
  if (distance < foodWeightRaduis * foodWeightRaduis) {
    return foodWeight / (distance + 1);
  }
  return 0;
}

function getDangerWeight(x: i32, y: i32,  snakeReachable: StaticArray<i32>): f64 {
  let ans: f64 = 0;
  let _x = x - 1;
  let _y = y - 1;
  if (snakeReachable[_x * mapSize + _y] > 0) {
    ans = dangerWeight / (snakeReachable[_x * mapSize + _y] * snakeReachable[_x * mapSize + _y]);
  }
  return ans;
}

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

// 辅助函数：获取当前方向（根据坐标）
function getCurrentDirectionByXY(headX: i32,
  headY: i32,
  bodyX: i32,
  bodyY: i32): i32 {
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

// 获取安全方向
function getSafeDirection(snake: i32[], otherSnakes: i32[], safeDirs: StaticArray<bool>): void {
  const headX = snake[0];
  const headY = snake[1];

  const currentDirection = getCurrentDirection(snake);
  const forbiddenDirection = getOppositeDirection(currentDirection); // 排除相反方向

  // 所有方向为安全
  safeDirs.fill(1);

  // 排除相反的方向
  safeDirs[forbiddenDirection] = false;
  for (let dir = 0; dir < 4; dir++) {
    if (!safeDirs[dir]) continue;

    let newX = headX;
    let newY = headY;
    switch (dir) {
      case 0: newY += 1; break;
      case 1: newX -= 1; break;
      case 2: newY -= 1; break;
      case 3: newX += 1; break;
    }

    // 撞墙
    if (newX < 1 || newX > 8 || newY < 1 || newY > 8) {
      safeDirs[dir] = false;
      continue;
    }

    for (let i = 0; i < otherSnakes.length; i += 2) {
      const otherX = otherSnakes[i];
      const otherY = otherSnakes[i + 1];
      if (otherX === newX && otherY === newY) {
        safeDirs[dir] = false;
        break;
      }
    }
  }
}