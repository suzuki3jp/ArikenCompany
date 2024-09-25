/* eslint-disable */
const depcheck = require('depcheck');
const { resolve } = require('path');

const unusedDepsCheck = async () => {
    const path = resolve(__dirname, '../');

    const result = await depcheck(path, {
        ignoreMatches: ['@types/jest', 'tsconfig-paths'],
    });
    const { dependencies, devDependencies } = result;
    if (dependencies || devDependencies)
        throw new Error('Found unused dependencies: ' + dependencies.concat(devDependencies).join(', '));
    return;
};

unusedDepsCheck();
