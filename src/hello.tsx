import { exec } from "child_process";
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";

const runShellCommand = async (command: string): Promise<string> => {
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

export default function Command() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);

  const fetchDocList = async () => {
    const docStr = await runShellCommand("ls -d ~/Documents/*/");
    const docList = docStr
      .split("\n")
      .filter((itm) => !!itm)
      .map((path) => {
        const pathList = path.split("/").filter((itm) => !!itm);
        const dirName = pathList[pathList.length - 1];
        return { name: dirName, path };
      });

    setRes(docList);
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  return (
    <Form>
      <Form.Dropdown id="project" title="Select Project" storeValue>
        {res.map((itm) => (
          <Form.Dropdown.Item key={itm.path} value={itm.path} title={itm.name} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="expireDays" title="Expire After Days" storeValue>
        <Form.Dropdown.Item value="1" title="1 Day" />
        <Form.Dropdown.Item value="2" title="2 Days" />
        <Form.Dropdown.Item value="3" title="3 Days" />
        <Form.Dropdown.Item value="7" title="1 Week" />
        <Form.Dropdown.Item value="14" title="2 Weeks" />
        <Form.Dropdown.Item value="30" title="1 Month" />
        <Form.Dropdown.Item value="90" title="3 Months" />
      </Form.Dropdown>
    </Form>
  );
}
