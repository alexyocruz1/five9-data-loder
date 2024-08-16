import { execSync } from 'child_process';

const getBranchName = () => {
  try {
    const branchName = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim();
    return branchName;
  } catch (error) {
    console.error('Error getting branch name:', error);
    return '';
  }
};

const branchName = getBranchName();
const scope = branchName.split('/')[1] || '';

const generalRules = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert']],
    'scope-case': [2, 'always', ['kebab-case', 'camel-case']],
    'subject-case': [2, 'always', 'sentence-case'],
    'scope-enum': [2, 'always', [scope]],
    'header-max-length': [2, 'always', 150],
  },
};

export default generalRules;