/* eslint-disable */
const depcheck = require('depcheck');
const { join } = require('path');

const unusedDepsCheck = async () => {
    const result = await depcheck(join(__dirname, '../'), {
        ignoreMatches: ['@types/jest', 'tsconfig-paths'],
    });
    const { dependencies, devDependencies } = result;
    if (dependencies || devDependencies)
        throw new Error('Found unused dependencies: ' + dependencies.concat(devDependencies).join(', '));
    return;
};

unusedDepsCheck();
