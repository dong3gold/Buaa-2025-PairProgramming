import assert from "assert";
import { greedy_snake_move } from "../build/debug.js";

// 辅助函数：将方向转换为可读字符串
function directionToString(dir) {
  switch (dir) {
    case 0: return "上";
    case 1: return "左";
    case 2: return "下";
    case 3: return "右";
    default: return "未知";
  }
}

// 测试案例列表
const testCases = [
  {
    name: "蛇头朝右，食物在右侧",
    snake: [4, 1, 3, 1, 2, 1, 1, 1],
    fruit: [6, 1],
    expected: 3 
  },
  {
    name: "蛇头朝右，食物在左侧",
    snake: [5, 1, 4, 1, 3, 1, 2, 1],
    fruit: [1, 1],
    expected: 0 
  },
  {
    name: "蛇头在左上角，食物在右下方",
    snake: [4, 2, 3, 2, 2, 2, 1, 2],
    fruit: [6, 1],
    expected: 3 
  },
  {
    name: "蛇在左下角回字形，食物在右上方",
    snake: [1, 1, 2, 1, 2, 2, 1, 2],
    fruit: [4, 3],
    expected: 0 
  },
  {
    name: "蛇在右上角回字形 食物在左下方",
    snake: [8, 7, 8, 8, 7, 8, 7, 7],
    fruit: [5, 5],
    expected: 1 
  },
];

// 运行测试
function runTests() {
  let passed = 0;
  let failed = 0;

  testCases.forEach(test => {
    const result = greedy_snake_move(test.snake, test.fruit);
    const expected = test.expected;
    
    try {
      assert.strictEqual(result, expected);
      console.log(`${test.name}：成功！返回方向 ${directionToString(result)}`);
      passed++;
    } catch (error) {
      console.error(`${test.name}：失败！`);
      console.error(`  预期方向：${directionToString(expected)}，实际返回：${directionToString(result)}`);
      failed++;
    }
  });

  console.log(`\n测试结果：通过 ${passed} 个，失败 ${failed} 个`);
}

// 执行测试
runTests();
console.log("ok");