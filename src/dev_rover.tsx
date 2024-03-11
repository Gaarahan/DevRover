
import { Action, ActionPanel, closeMainWindow, Form, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execCommand, getAllSession, openItermAndRun } from './utils';

const ProjectReg = /\/([\w\s-_]+)\/$/;

export default function Command() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDocList = async () => {
    const docStr = await execCommand("ls -d ~/Documents/*/");
    const docList = docStr
      .split("\n")
      .map((path) => ({ name: ProjectReg.exec(path || '')?.[1], path }))
      .filter(itm => itm.name);

    setRes(docList);
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  const openProject = async ({ projectPath }) => {
    setLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Waitting",
    });

    // check and switch tmux session
    const allSession = (await getAllSession()).split('\n');
    const curName = ProjectReg.exec(projectPath)?.[1];

    if (allSession.includes(curName)) {
      toast.style = Toast.Style.Success;
      toast.message = `Exist session ${curName} is open successfully`;

      await execCommand(`tmux switch -t ${curName}`);
    } else {
      toast.style = Toast.Style.Success;
      toast.message = `New session ${curName} is setup successfully`;

      // open vim
      await execCommand(
        `tmux new-session -d -s ${curName} -A`,
        `tmux switch -t ${curName}`
      );
      await openItermAndRun(`cd ${projectPath}`, 'nvim');
    }

    setLoading(false);
    setTimeout(async () => await closeMainWindow(), 1000);
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Open In Neovim" onSubmit={openProject} />
          <Action title="[WIP]Update All Repo" />
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
