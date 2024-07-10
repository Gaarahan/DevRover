import child_process, { execFileSync } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(child_process.exec);

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
  execFileSync("osascript", ["-e", cmd]);
}