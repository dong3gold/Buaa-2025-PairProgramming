import assert from "assert";
import { greedy_snake_move_barriers } from "../build/debug.js";
// 导入函数（假设函数在同一文件中）
// 如果是模块化项目，请使用 import 语法。
// import { greedy_snake_move_barriers } from './your_module';

// 测试方法
function testGreedySnakeMoveBarriers() {
  console.log("开始测试 greedy_snake_move_barriers...");

  // 定义测试用例
  const testCases = [
    {
      name: "果子可达",
      snake: [4, 4, 3, 4, 2, 4, 1, 4], // 蛇头在 (4, 4)
      fruit: [6, 6], // 果子在 (6, 6)
      barriers: [5, 5, 5, 6, 5, 7, 6, 5, 7, 5, 7, 6, 7, 7, 8, 5, 8, 6, 8, 7, 8, 8], // 障碍物
      expected: 3 // 向右移动
    },
    {
      name: "果子不可达",
      snake: [4, 4, 3, 4, 2, 4, 1, 4], // 蛇头在 (4, 4)
      fruit: [6, 6], // 果子在 (6, 6)
      barriers: [5, 5, 5, 6, 5, 7, 6, 5, 6, 6, 6, 7, 7, 5, 7, 6, 7, 7, 8, 5, 8, 6, 8, 7, 8, 8], // 障碍物包围果子
      expected: -1 // 果子不可达
    },
    {
      name: "蛇撞墙",
      snake: [8, 8, 7, 8, 6, 8, 5, 8], // 蛇头在 (8, 8)
      fruit: [8, 7], // 果子在 (8, 7)
      barriers: [], // 没有障碍物
      expected: 2 // 向下移动会导致撞墙
    },
    {
      name: "蛇撞障碍物",
      snake: [4, 4, 3, 4, 2, 4, 1, 4], // 蛇头在 (4, 4)
      fruit: [4, 5], // 果子在 (4, 5)
      barriers: [4, 5, 5, 5, 5, 6, 6, 5, 7, 5, 7, 6, 7, 7, 8, 5, 8, 6, 8, 7, 8, 8], // 障碍物挡住路径
      expected: -1 // 果子不可达
    },
    {
      name: "掉头，果子在角落",
      snake: [1, 1, 1, 2, 1, 3, 1, 4],
      fruit: [1, 7],
      barriers: [2, 7, 2, 6, 3, 7, 3, 6, 4, 7, 4, 6, 5, 7, 5, 6, 1, 8, 6, 6, 7, 6, 8, 6],
      expected: 3
    }
  ];

  // 执行测试用例
  testCases.forEach(({ name, snake, fruit, barriers, expected }, index) => {
    console.log(`\n测试用例 ${index + 1}: ${name}`);
    console.log(`输入: 蛇=${JSON.stringify(snake)}, 果子=${JSON.stringify(fruit)}, 障碍物=${JSON.stringify(barriers)}`);

    const result = greedy_snake_move_barriers(snake, fruit, barriers);
    console.log(`输出: ${result}, 期望: ${expected}`);

    if (result === expected) {
      console.log("测试通过 ✅");
    } else {
      console.log("测试失败 ❌");
    }
  });

  console.log("\n所有测试完成！");
}

// 调用测试方法
testGreedySnakeMoveBarriers();

import { greedy_snake_move_barriers as greedySnakeMoveBarriers } from "../build/release.js";
function greedy_snake_barriers_checker(initial_snake, food_num, foods, barriers, access) {
  if (initial_snake.length !== 8) throw "Invalid snake length";

  let current_snake = [...initial_snake];
  let current_foods = [...foods];
  const barriers_list = [];
  for (let i = 0; i < barriers.length; i += 2) {
    const x = barriers[i];
    const y = barriers[i + 1];
    if (x !== -1 && y !== -1) {
      barriers_list.push({ x, y });
    }
  }
  let turn = 1;

  while (turn <= 200) {
    const direction = greedySnakeMoveBarriers(current_snake, current_foods, barriers);

    if (access === 0) {
      if (direction !== -1) {
        return -5;
      } else {
        return 1;
      }
    }

    // invalid direction
    if (direction < 0 || direction > 3) return -4;

    let new_snake = [
      current_snake[0] + (direction == 3) - (direction == 1),
      current_snake[1] + (direction == 0) - (direction == 2),
      current_snake[0],
      current_snake[1],
      current_snake[2],
      current_snake[3],
      current_snake[4],
      current_snake[5],
    ];


    // out of range
    if (new_snake[0] < 1 || new_snake[0] > 8 || new_snake[1] < 1 || new_snake[1] > 8) return -1;

    // hit a barrier
    if (barriers_list.some(ob => ob.x === new_snake[0] && ob.y === new_snake[1])) return -2;

    // eat food
    let ate_index = -1;
    for (let i = 0; i < current_foods.length; i += 2) {
      if (new_snake[0] === current_foods[i] && new_snake[1] === current_foods[i + 1]) {
        ate_index = i;
        break;
      }
    }

    // console.log("turn " + turn + " :" + direction);
    if (ate_index !== -1) {
      current_foods.splice(ate_index, 2);
      food_num -= 1;
    }

    if (food_num === 0) {
      console.log("Total turn: " + turn);
      return turn;
    }

    current_snake = new_snake;
    turn++;
  }

  // timeout
  return -3;
}

console.log("来自课程组的测试")

assert.strictEqual(
  greedy_snake_barriers_checker(
    [4, 4, 4, 3, 4, 2, 4, 1],
    1,
    [4, 5],
    [5, 4, 8, 8, 8, 7, 8, 6, 8, 5, 8, 4, 8, 3, 8, 2, 8, 1, 7, 8, 7, 7, 7, 6],
    1
  ) > 0,
  true
);

assert.strictEqual(
  greedy_snake_barriers_checker(
    [1, 4, 1, 3, 1, 2, 1, 1],
    1,
    [5, 5],
    [2, 7, 2, 6, 3, 7, 3, 6, 4, 6, 5, 6, 6, 6, 7, 6, 4, 5, 4, 4, 4, 3, 5, 4],
    1
  ) > 0,
  true
);

assert.strictEqual(
  greedy_snake_barriers_checker(
    [1, 4, 1, 3, 1, 2, 1, 1],
    1,
    [1, 7],
    [2, 7, 2, 6, 3, 7, 3, 6, 4, 7, 4, 6, 5, 7, 5, 6, 1, 6, 6, 6, 7, 6, 8, 6],
    0
  ),
  1
);

// 掉头
assert.strictEqual(
  greedy_snake_barriers_checker(
    [6, 8, 5, 8, 4, 8, 3, 8],
    1,
    [1, 8],
    [2, 7, 2, 6, 3, 7, 3, 6, 4, 7, 4, 6, 5, 7, 5, 6, 1, 7, 6, 6, 7, 6, 8, 6],
    1
  ) > 0,
  true
);

// 掉不了头
assert.strictEqual(
  greedy_snake_barriers_checker(
    [6, 8, 5, 8, 4, 8, 3, 8],
    1,
    [1, 8],
    [2, 7, 2, 6, 3, 7, 3, 6, 4, 7, 4, 6, 5, 7, 5, 6, 1, 7, 6, 6, 6, 7, 7, 6, 7, 7, 8, 6],
    0
  ),
  1
);

console.log("🎉 You have passed all the tests provided.");