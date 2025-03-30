import * as childProcess from 'child_process';
import * as fs from 'fs';

export const buildFrontend = () => {
  [`${process.cwd()}/../agent/.mastra`].forEach(
    (dir) => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, {
          recursive: true,
        });
      }
    },
  );

  ['pnpm build'].forEach((cmd) => {
    childProcess.execSync(cmd, {
      cwd: `${process.cwd()}/../agent`,
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env },
      shell: 'bash',
    });
  });
};
