import { exec } from "child_process";
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";

const BIN_ENV = Object.assign({}, process.env, { PATH: "/usr/local/bin:/usr/bin:/opt/homebrew/bin" });

export const execCommand = async (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, { env: BIN_ENV }, (error, stdout, stderr) => {
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
};