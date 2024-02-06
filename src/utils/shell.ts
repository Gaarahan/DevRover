import { exec } from "child_process";
import { runAppleScript } from "run-applescript";

const BIN_ENV = Object.assign({}, process.env, { PATH: "/bin:/usr/local/bin:/usr/bin:/opt/homebrew/bin" });

export async function execCommand(...command: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command.join(" && "), { env: BIN_ENV }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}

export async function openItermAndRun(...command: string[]) {
  const scpt = `tell application "iTerm"
  activate
  tell current session of current tab of current window
    write text "${command.join(" && ")}"
  end tell
end tell`;
  return runAppleScript(scpt);
}
