/* eslint-disable */
const depcheck = require('depcheck');
const { resolve } = require('path');
const { exec } = require('child_process');

const unusedDepsCheck = async () => {
    const path = resolve(__dirname, '../');

    console.log(await exec(`ls ${path}`));

    const result = await depcheck(path, {
        ignoreMatches: ['@types/jest', 'tsconfig-paths'],
    });
    const { dependencies, devDependencies } = result;
    if (dependencies || devDependencies)
        throw new Error('Found unused dependencies: ' + dependencies.concat(devDependencies).join(', '));
    return;
};

unusedDepsCheck();
