import fs from "node:fs/promises";
import path from "path";
import child_process from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(child_process.exec);

export type IUpdateRes = {
  success: boolean;
  msg: string;
};
export type IUpdateTask = {
  path: string;
  isMasterBranch: boolean;
  taskDescMarkdown: string;
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
        taskDescMarkdown: `- **${file}**${isMasterBranch ? " - *master*" : ""}`,
        runner: () => updateGitRepository(fullPath),
      });
    }
  }

  return tasks;
}

export async function isInMasterBranch(path: string) {
  const { stdout: branchList } = await exec(`git branch`, { cwd: path });

  return branchList.split("\n").includes("* master");
}

// 检查一个目录是否为 git 仓库
export async function isGitRepository(dir: string): Promise<boolean> {
  return await isValidPath(path.join(dir, ".git/"));
}

// 更新git仓库的函数
async function updateGitRepository(dir: string): Promise<IUpdateRes> {
  try {
    const { stdout, stderr } = await exec("git pull", { cwd: dir });
    if (stderr) {
      return { success: false, msg: stderr };
    } else {
      return { success: true, msg: stdout };
    }
  } catch (e: any) {
    return { success: false, msg: e.toString() };
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
