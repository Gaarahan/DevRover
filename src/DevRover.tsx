
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { runShellCommand } from './utils/shellUtils';


export default function DevRover() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);

  runShellCommand("va")

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
    </Form>
  );
}
