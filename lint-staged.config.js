const path = require('path');
const fs = require('fs');

module.exports = (stagedFiles) => {
  const tasks = [];

  console.log('확인>>>', stagedFiles);

  stagedFiles.forEach((file) => {
    // apps 디렉터리의 루트 경로 추출
    const match = file.match(/^apps\/[^/]+/);
    if (match) {
      const appDir = match[0];
      const eslintConfigPath = path.join(appDir, 'eslint.config.mjs');

      if (fs.existsSync(eslintConfigPath)) {
        tasks.push(`eslint --fix --config ${eslintConfigPath} ${file}`);
      }
    }
  });

  return tasks;
};
