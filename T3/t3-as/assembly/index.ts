// 记录当前路径的方向序列
let pathDirections: i32[] = [];

let mapSize = 8; // 地图大小
// 记录每个位置蛇的可能到达情况
let snakeReachable: StaticArray<i32> | null = null;
const reachableNull = -10;

let visMap: StaticArray<i32> | null = null;
let safeDirs: StaticArray<bool> = new StaticArray<bool>(4);

// 食物权重，食物权重半径，自由权重（待办），危险权重
let foodWeight = 5, foodWeightRaduis = 3, freedomWeight = 20, dangerWeight = 10;
const maxReachStep = 5; // BFS计算可达性时的最大步数
const maxFloodStep = 4; // 计算自由度时的最大步数

export function greedy_snake_step(
  n: i32,
  snake: i32[],
  snakeNum: i32,
  otherSnake: i32[],
  foodNum: i32,
  foods: i32[],
  round: i32
): i32 {
  if (snakeNum == 0) {
    return greedy_snake_step_bfs(n, snake, snakeNum, otherSnake, foodNum, foods, round);
  } else {
    // 1v1 时，调整部分权重
    if (snakeNum == 1) {
      foodWeight = 10;
      foodWeightRaduis = 4;
      freedomWeight = 8;
    }
    return greedy_snake_step_weight(n, snake, snakeNum, otherSnake, foodNum, foods, round);
  }
}

export function initGlobalVars(n: i32): void {
  mapSize = n;
  snakeReachable = new StaticArray<i32>(mapSize * mapSize);
  visMap = new StaticArray<i32>(mapSize * mapSize * 4);
}

function greedy_snake_step_weight(
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
    initGlobalVars(n);
  }


  let curDirection = getCurrentDirection(snake);
  let curX = snake[0];
  let curY = snake[1];

  // 计算当前蛇的可达性
  getSafeDirection(snake, otherSnake, safeDirs);


  computeAllReachable(snakeNum, otherSnake, snakeReachable!, visMap!, maxReachStep);

  const directions = [
    [0, 1], // 上（0）
    [-1, 0], // 左（1）
    [0, -1], // 下（2）
    [1, 0]   // 右（3）
  ];

  let weights = new StaticArray<f64>(4);
  let maxWeight: f64 = -1e10;
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
    const dangerWeight = getDangerWeight(newX, newY, 1, snakeReachable!);
    const freedomWeight = getFreedomWeight(newX, newY, snakeReachable!, visMap!, maxFloodStep);

    // console.log(`newX: ${newX}, newY: ${newY}, foodWeight: ${foodWeight}, dangerWeight: ${dangerWeight}, freedomWeight: ${freedomWeight}`);
    const weight = foodWeight - dangerWeight * (foodWeight > 1 ? foodWeight : 1) + freedomWeight;
    // console.log(`weight: ${weight}`);
    weights[dir] = weight;
    if (weight > maxWeight) {
      maxWeight = weight;
      bestDir = dir;
    }
  }

  return bestDir;
}

function cleanSnakeReachable(snakeReachable: StaticArray<i32>): void {
  snakeReachable.fill(reachableNull);
}

function updateReachable(
  snakeReachable: StaticArray<i32>, x: i32, y: i32, start: i32): void {
  const loc = x * mapSize + y;
  if (snakeReachable[loc] == reachableNull) {
    snakeReachable[loc] = start;
  } else {
    snakeReachable[loc] = min(snakeReachable[loc], start);
  }
}


// BFS计算可达性
function computeReachable(
  snake: i32[],
  snakeIdx: i32,
  steps: i32,
  snakeReachable: StaticArray<i32>,
  visMap: StaticArray<i32>,
): void {
  visMap.fill(0);

  const headX = snake[snakeIdx * 8] - 1;
  const headY = snake[snakeIdx * 8 + 1] - 1;
  const curDir = getCurrentDirectionByXY(headX, headY, snake[snakeIdx * 8 + 2] - 1, snake[snakeIdx * 8 + 3] - 1);

  // BFS 队列
  const queue: i32[] = [headX, headY, curDir, 0];
  visMap[(headX * mapSize + headY) * 4 + curDir] = 1;

  for (let i = snakeIdx * 8, cnt = 0; i < snakeIdx * 8 + 4; i += 2, cnt -= 1) {
    const x = snake[i] - 1;
    const y = snake[i + 1] - 1;
    updateReachable(snakeReachable, x, y, cnt);
  }

  // 方向数组
  const directions = [
    [0, 1], // 上（0）
    [-1, 0], // 左（1）
    [0, -1], // 下（2）
    [1, 0]  // 右（3）
  ];

  while (queue.length >= 2) {
    const x = queue.shift();
    const y = queue.shift();
    const dir = queue.shift();
    const step = queue.shift();
    if (step > steps) {
      continue;
    }

    for (let i = 0; i < directions.length; i++) {
      if (i == getOppositeDirection(dir))
        continue;
      const nx = x + directions[i][0];
      const ny = y + directions[i][1];
      const ndir = i;
      const loc = (nx * mapSize + ny);
      const nstep = step + 1;

      if (nx >= 0 && nx < mapSize &&
        ny >= 0 && ny < mapSize &&
        visMap[(loc * 4 + ndir)] == 0
      ) {
        visMap[(loc * 4 + ndir)] = nstep;
        queue.push(nx);
        queue.push(ny);
        queue.push(ndir);
        queue.push(step + 1);
        updateReachable(snakeReachable, nx, ny, nstep);
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
    computeReachable(otherSnakes, i, steps, snakeReachable, visMap);
  }
}

export function computeAllReachable_(snakeNum: i32, otherSnakes: i32[], steps: i32): void {
  computeAllReachable(snakeNum, otherSnakes, snakeReachable!, visMap!, steps);
}

// 计算全部食物对x,y的权重
export function getFoodWeights(x: i32, y: i32, foodNum: i32, foods: i32[]): f64 {
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

function getDangerWeight(x: i32, y: i32, step: i32, snakeReachable: StaticArray<i32>): f64 {
  const _x = x - 1;
  const _y = y - 1;

  const reachTime = snakeReachable[_x * mapSize + _y];
  if (reachTime == reachableNull || reachTime > step) {
    return 0;
  }

  const reachTime_ = reachTime <= 0 ? 1 : reachTime;

  return dangerWeight / (reachTime_ * reachTime_);
}

export function getDangerWeight_(x: i32, y: i32, step: i32): f64 {
  return getDangerWeight(x, y, step, snakeReachable!);
}

function getFreedomWeight(x: i32, y: i32, snakeReachable: StaticArray<i32>, visMap: StaticArray<i32>, maxStep: i32): f64 {
  visMap.fill(0);

  const score = <f64>dfs_flood(x - 1, y - 1, snakeReachable, visMap, 1, maxStep) / (<f64>maxStep * maxStep) - 0.3;
  if (score < 0) {
    return score * 2 * freedomWeight
  } else
    return score * freedomWeight;
}


function dfs_flood(x: i32, y: i32, snakeReachable: StaticArray<i32>, visMap: StaticArray<i32>, step: i32, maxStep: i32): i32 {
  if (step > maxStep) {
    return 0;
  }

  const loc = x * mapSize + y;
  if (x < 0 || x >= mapSize || y < 0 || y >= mapSize) {
    return 0;
  }
  if (visMap[loc] == 1) {
    return 0;
  }
  visMap[loc] = 1;
  const reachTime = snakeReachable[loc];
  if (reachTime != reachableNull && reachTime < step) {
    return 0;
  }

  // console.log(`x: ${x}, y: ${y}, step: ${step}, reachTime: ${reachTime}`);
  return dfs_flood(x + 1, y, snakeReachable, visMap, step + 1, maxStep) +
    dfs_flood(x - 1, y, snakeReachable, visMap, step + 1, maxStep) +
    dfs_flood(x, y + 1, snakeReachable, visMap, step + 1, maxStep) +
    dfs_flood(x, y - 1, snakeReachable, visMap, step + 1, maxStep) + 1;
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
    if (newX < 1 || newX > mapSize || newY < 1 || newY > mapSize) {
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


// 只有自己一条蛇的时候，采用bfs，吃最近的食物
let targetX = 0, targetY = 0;
let foodsSet = new Set<string>();
function greedy_snake_step_bfs(
  n: i32,
  snake: i32[],
  snakeNum: i32,
  otherSnake: i32[],
  foodNum: i32,
  foods: i32[],
  round: i32
): i32 {
  let res = greedy_snake_move_barriers(snake, foodNum, foods);
  return res;
}

function greedy_snake_move_barriers(
  snake: i32[],
  foodNum: i32,
  foods: i32[]
): i32 {

  if ((snake[0] === targetX && snake[1] === targetY) || (targetX === 0 && targetY === 0)) {
    foodsSet.clear();
    for (let i = 0; i < foodNum; i++) {
      const foodX = foods[i * 2];
      const foodY = foods[i * 2 + 1];
      const loc = `${foodX},${foodY}`;
      foodsSet.add(loc);
    }
  }
  // 获取下一步
  const dir = computePath(snake, foodsSet);
  return dir;
}

// BFS计算路径方向序列
function computePath(
  snake: i32[],
  foods: Set<string>
): i32 {
  const headX = snake[0];
  const headY = snake[1];
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
    const loc = `${x},${y}`;

    // 找到，则返回路径
    if (foods.has(loc)) {
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
      if (nx >= 1 && nx <= mapSize &&
        ny >= 1 && ny <= mapSize &&
        !visited.has(key)) {
        visited.add(key);
        queue.push(nx);
        queue.push(ny);
        queue.push(ndir);
        prevDir.set(key, p); // 设置前驱
      }
    }
  }

  return curDir;
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