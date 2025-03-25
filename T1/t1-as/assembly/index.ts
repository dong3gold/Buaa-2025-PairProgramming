// The entry file of your WebAssembly module.

export function greedySnakeMove(snake: i32[], fruit: i32[]): i32 {
  const headX = snake[0];
  const headY = snake[1];
  const fruitX = fruit[0];
  const fruitY = fruit[1];

  const currentDirection = getCurrentDirection(snake);
  const forbiddenDirection = getOppositeDirection(currentDirection); // 排除相反方向

  // 所有方向为安全
  const directions: bool[] = [true, true, true, true];

  // 排除相反的方向
  directions[forbiddenDirection] = false;
  for (let dir = 0; dir < 4; dir++) {
    if (!directions[dir]) continue;

    let newX = headX;
    let newY = headY;
    switch (dir) {
      case 0: newY -= 1; break;
      case 1: newX -= 1; break;
      case 2: newY += 1; break;
      case 3: newX += 1; break;
    }

    // 撞墙
    if (newX < 1 || newX > 8 || newY < 1 || newY > 8) {
      directions[dir] = false;
      continue;
    }

    // 撞身体
    for (let i = 2; i < snake.length; i += 2) {
      if (snake[i] === newX && snake[i+1] === newY) {
        directions[dir] = false;
        break;
      }
    }
  }

  // 选择向果子移动的方向
  const fruitDir = getDirectionTowardsFruit(headX, headY, fruitX, fruitY);
  if (directions[fruitDir]) return fruitDir;

  // 第一个安全的方向
  for (let dir = 0; dir < 4; dir++) {
    if (directions[dir]) return dir;
  }

  // 都不安全，直接返回
  return currentDirection;
}

// 获取当前方向
function getCurrentDirection(snake: i32[]): i32 {
  const headX = snake[0];
  const headY = snake[1];
  const bodyX = snake[2];
  const bodyY = snake[3];

  if (headX > bodyX) return 3; // 右
  if (headX < bodyX) return 1; // 左
  if (headY > bodyY) return 2; // 下
  if (headY < bodyY) return 0; // 上
  return 0;
}

// 获取相反方向
function getOppositeDirection(dir: i32): i32 {
  switch (dir) {
    case 0: return 2;
    case 1: return -1;
    case 2: return 0;
    case 3: return 1;
    default: return 0;
  }
}

// 计算向果子移动的方向
function getDirectionTowardsFruit(
  headX: i32, headY: i32,
  fruitX: i32, fruitY: i32
): i32 {
  if (headX < fruitX) return 3;
  if (headX > fruitX) return 1;
  if (headY < fruitY) return 2;
  if (headY > fruitY) return 0;
  return 0;
}