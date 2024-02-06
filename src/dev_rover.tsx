
import { Action, ActionPanel, Clipboard, Form, Icon, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execCommand, getAllSession } from './utils';

const ProjectReg = /\/([\w\s-_]+)\/$/;

export default function Command() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);

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

  const openProject = ({ projectPath }) => {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Waitting",
    });

    // TODO: check if terminal open

    // check and switch tmux session
    const allSession = getAllSession().split('\n');
    const curName = ProjectReg.exec(projectPath)?.[1];

    if (allSession.includes(curName)) {
      toast.style = Toast.Style.Success;
      toast.message = `Exist session ${sessionName} is open successfully`;
    } else {
      // open vim
      toast.style = Toast.Style.Success;
      toast.message = `New session ${sessionName} is setup successfully`;
    }
    console.log(allSession, curName)
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Open In Neovim" onSubmit={openProject} />
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
