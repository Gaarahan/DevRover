import { exec } from "child_process";
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";

export const runShellCommand = async (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`stderr: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  };