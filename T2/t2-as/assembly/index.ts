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

  // 获取路径序列
  const path = computePath(snake, fruit, barrierSet);
  if (path === null) {
    return -1; // 不可达
  }
  pathDirections = path;

  // 蛇头按路径方向移动
  if (pathDirections.length > 0) {
    const nextDir = pathDirections[0];
    pathDirections = pathDirections.slice(1); // pop_front
    return nextDir;
  } else {
    return getCurrentDirection(snake);
  }
}

// BFS计算路径方向序列
function computePath(
  snake: i32[],
  fruit: i32[],
  barriers: Set<string>
): i32[] | null {
  const headX = snake[0];
  const headY = snake[1];
  const fruitX = fruit[0];
  const fruitY = fruit[1];

  // BFS 队列
  const queue: i32[] = [headX, headY];
  const visited = new Set<string>();
  const prevDir = new Map<string, i32>(); // -1 表示无前驱

  visited.add(`${headX},${headY}`);
  prevDir.set(`${headX},${headY}`, -1);

  while (queue.length >= 2) {
    const x = queue.shift();
    const y = queue.shift();

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

    for (let i = 0; i < directions.length; i++) {
      const nx = directions[i][0];
      const ny = directions[i][1];
      const dir = directions[i][2];
      const key = `${nx},${ny}`;
      if (nx >= 1 && nx <= 8 &&
          ny >= 1 && ny <= 8 &&
          !visited.has(key) &&
          !barriers.has(key)
      ) {
        visited.add(key);
        queue.push(nx);
        queue.push(ny);
        prevDir.set(key, dir); // 设置前驱
      }
    }
  }

  return null;
}

// 利用map, 生成方向序列
function buildPath(
  prevDir: Map<string, i32>,
  x: i32,
  y: i32
): i32[] {
  const path: i32[] = [];
  let currentX = x;
  let currentY = y;

  while (prevDir.get(`${currentX},${currentY}`) !== -1) { // -1 为初始节点
    const dir = <i32>prevDir.get(`${currentX},${currentY}`);
    path.unshift(dir);
    // 根据方向反向回溯到前一个坐标
    switch (dir) {
      case 0: currentY -= 1; break;
      case 1: currentX += 1; break;
      case 2: currentY += 1; break;
      case 3: currentX -= 1; break;
    }
  }

  return path;
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