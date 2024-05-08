import child_process from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import path from "path";

const exec = promisify(child_process.exec);
const execFileSync = promisify(child_process.execFileSync);

const BIN_ENV = Object.assign({}, process.env, {
  PATH: "/bin:/usr/local/bin:/usr/bin:/opt/homebrew/bin",
});

export async function execCommand(...command: string[]): Promise<string> {
  const { stdout, stderr } = await exec(command.join(" && "), { env: BIN_ENV });
  if (stderr) {
    return `Stderr: ${stderr}`;
  } else {
    return stdout;
  }
}

export async function openItermAndRun(...command: string[]) {
  const cmd = `
  tell application "iTerm" 
	  activate
	    tell current session of current tab of current window
        ${command.map((str) => `write text "${str}"`).join("\n")}
	    end tell
  end tell`;

  await execCommand(`open -b com.googlecode.iterm2`);
  await execFileSync(`osascript -e ${cmd}`);
}

export type IUpdateRes = {
  success: boolean;
  msg: string;
};
type IUpdateTask = {
  path: string;
  isMasterBranch: boolean;
  runner: () => Promise<IUpdateRes>;
};
export async function getUpdateTasksByPath(
  specifyPath: string,
): Promise<IUpdateTask[]> {
  const tasks: IUpdateTask[] = [];
  const fileList = await fs.readdir(specifyPath);
  for (const file of fileList) {
    const fullPath = path.join(specifyPath, file);
    const isGitRepo = await isGitRepository(fullPath);

    if (isGitRepo) {
      const isMasterBranch = await isInMasterBranch(fullPath);
      tasks.push({
        path: file,
        isMasterBranch,
        runner: () => updateGitRepository(fullPath),
      });
    }
  }

  return tasks;
}

export async function isInMasterBranch(path: string) {
  const { stdout: curBranch } = await exec(
    `git branch | head -n 1 | awk '{print $2}'`,
    { cwd: path },
  );

  return curBranch === "master";
}

// 检查一个目录是否为 git 仓库
export async function isGitRepository(dir: string): Promise<boolean> {
  return await isValidPath(path.join(dir, ".git/"));
}

// 更新git仓库的函数
async function updateGitRepository(dir: string): Promise<IUpdateRes> {
  const { stdout, stderr } = await exec("git pull", { cwd: dir });
  if (stderr) {
    return { success: false, msg: stderr };
  } else {
    return { success: true, msg: stdout };
  }
}

async function isValidPath(dir: string): Promise<boolean> {
  try {
    await Promise.all([
      fs.access(dir, fs.constants.R_OK),
      fs.access(dir, fs.constants.W_OK),
    ]);
    return true;
  } catch (e) {
    return false;
  }
}

export function getGitRepoByPath(dir: string) {
  if (!isValidPath(dir)) throw new Error();
}
