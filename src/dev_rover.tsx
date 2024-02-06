
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { runShellCommand } from './utils';

const ProjectReg = /\/[\w\s]+\/$/;

export default function Command() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);

  const fetchDocList = async () => {
    const docStr = await runShellCommand("ls -d ~/Documents/*/");
    const docList = docStr
      .split("\n")
      .filter((itm) => !!itm)
      .map((path) => ({ name: ProjectReg.exec(path), path }));

    setRes(docList);
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  const openProject = ({ projectPath }) => {
    // TODO: check if terminal open

    // check and switch tmux session
    const allSession = getAllSession();
    const curName = ProjectReg.exec(projectPath);
    console.log(allSession, curName)
    // open vim
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Open In Neovim" onAction={openProject} />
          <Action title="Update All Repo" />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="projectPath" title="Select Project" storeValue>
        {res.map((itm) => (
          <Form.Dropdown.Item key={itm.path} value={itm.path} title={itm.name} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
