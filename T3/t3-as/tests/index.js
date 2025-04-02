import { getFoodWeights, getDangerWeight_, computeAllReachable_, initGlobalVars } from "../build/debug.js";
import assert from "assert";

function test() {
    const mapSize = 8;

    initGlobalVars(mapSize);

    console.log("foodWeight should increase when food is closer");
    {
        const foodNum = 1;
        const foods = [5, 4]; // Food at (5, 4)

        const weight1 = getFoodWeights(4, 4, foodNum, foods); // Snake head position
        const weight2 = getFoodWeights(5, 4, foodNum, foods); // Food position

        console.log("weight1: " + weight1);
        console.log("weight2: " + weight2);

        assert.strictEqual(weight1 < weight2, true);
        console.log("foodWeight test passed");
    };

    console.log("dangerWeight should increase when another snake is closer");
    {
        const otherSnake = [5, 5, 6, 5]; // Another snake at (5, 4)

        computeAllReachable_(1, otherSnake, 3)

        const weight1 = getDangerWeight_(4, 5, 1); // Snake head position
        const weight2 = getDangerWeight_(3, 4, 1); // Danger position

        console.log("weight1: " + weight1);
        console.log("weight2: " + weight2);

        assert.strictEqual(weight1 > weight2, true);
        console.log("dangerWeight test passed");
    };
}

test();
console.log("All tests passed!");

