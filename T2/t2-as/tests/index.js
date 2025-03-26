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