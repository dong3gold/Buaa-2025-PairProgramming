// 执行测试函数若干次，收集数据并计算统计信息
const { execSync } = require('child_process');

function runTestAndCollectData(niter) {
    const results = [0, 0, 0, 0];
    for (let i = 0; i < niter; i++) {
        const output = execSync('node runTest.js', { encoding: 'utf-8' });
        try {
            const data = JSON.parse(output);
            if (Array.isArray(data)) {
                for (let j = 0; j < data.length; j++) {
                    if (typeof data[j] === 'number') {
                        results[j] += data[j];
                    } else {
                        console.error(`Unexpected data type: ${typeof data[j]}`);
                    }
                }
            } else {
                console.error(`Unexpected output (not an array): ${output}`);
            }
        } catch (error) {
            console.error(`Failed to parse output: ${output}`);
        }
    }
    return results;
}

function calculateStatistics(data, niter) {
    const mean = data.map(x => x / niter);
    const argmax = data.indexOf(Math.max(...data));
    return {
        mean,
        argmax,
        max: Math.max(...data),
    }
}

function main() {
    const niter = 100;
    const results = runTestAndCollectData(niter);
    const stats = calculateStatistics(results, niter);
    console.log('Statistics:', stats);
}

main();