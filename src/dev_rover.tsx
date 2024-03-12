import { Action, ActionPanel, closeMainWindow, Form, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execCommand, getAllSession, openItermAndRun } from "./utils";
import { ErrorScreen, ErrorType } from "./pages/error";

const ProjectReg = /\/([\w\s-_]+)\/$/;

interface IFormData {
  projectPath: string;
}

export default function Command() {
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorInfo, changeErrorInfo] = useState<{ type: ErrorType; errorMsg?: string } | undefined>();

  const fetchDocList = async () => {
    const docStr = await execCommand("ls -d ~/Documents/*/");
    const docList = docStr
      .split("\n")
      .map((path) => ({ name: ProjectReg.exec(path || "")?.[1], path }))
      .filter((itm) => !!itm.name) as { name: string; path: string }[];

    setRes(docList);
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  const openProject = async ({ projectPath }: IFormData) => {
    setLoading(true);
    try {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Waitting",
      });

      // check and switch tmux session
      const allSession = (await getAllSession()).split("\n");
      const curName = ProjectReg.exec(projectPath)?.[1];

      if (curName && allSession.includes(curName)) {
        toast.style = Toast.Style.Success;
        toast.message = `Exist session ${curName} is open successfully`;

        await execCommand(`tmux switch -t ${curName}`);
      } else {
        toast.style = Toast.Style.Success;
        toast.message = `New session ${curName} is setup successfully`;

        // open vim
        await execCommand(`tmux new-session -d -s ${curName} -A`, `tmux switch -t ${curName}`);
        await openItermAndRun(`cd ${projectPath}`, "nvim");
      }
    } catch (e: any) {
      if (e.stderr.includes("-1743")) {
        changeErrorInfo({ type: ErrorType.PERMISSION });
      } else {
        changeErrorInfo({ type: ErrorType.GENERAL, errorMsg: e.toString() });
      }
    }

    setLoading(false);
    setTimeout(async () => await closeMainWindow(), 1000);
  };

  return errorInfo?.type ? (
    <ErrorScreen type={errorInfo.type} errorMsg={errorInfo.errorMsg} />
  ) : (
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
