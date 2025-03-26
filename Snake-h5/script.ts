interface Point {
    x: number;
    y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export function getNextMove(snake: Point[], food: Point, curDirection: Direction, gridSize: number): Direction {
    return wrap(snake, food, curDirection, gridSize, exampleMove);
}

function wrap(snake: Point[], food: Point, curDirection: Direction, gridSize: number, moveFunc: Function) {
    let _snake: number[] = [];
    for (let i = 0; i < snake.length; i++) {
        _snake.push(snake[i].x);
        _snake.push(snake[i].y);
    }
    let _food = [food.x, food.y];
    return moveFunc(_snake, _food);
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