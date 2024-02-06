import { Action, ActionPanel, closeMainWindow, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import {
  execCommand,
  getAllSession,
  openItermAndRun,
  GeneralErrorScreen,
  isPermissionError,
  PermissionErrorScreen,
} from "./utils";

const ProjectReg = /\/([\w\s-_]+)\/$/;

interface FormData {
  projectPath: string;
}

enum PageMode {
  Normal = "Normal",
  PermissionError = "PermissionError",
  UnexpectError = "UnexpectError",
}

export default function Command() {
  const [pageMode, changeMode] = useState<PageMode>(PageMode.Normal);
  const [repoList, setRepoList] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDocList = async () => {
    const docStr = await execCommand("ls -d ~/Documents/*/");
    const docList: { name: string; path: string }[] = docStr
      .split("\n")
      .map((path) => ({ name: ProjectReg.exec(path || "")?.[1] || "", path }))
      .filter((itm) => itm.name);

    setRepoList(docList);
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  const openProject = async ({ projectPath }: FormData) => {
    setLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Waitting",
    });

    // check and switch tmux session
    const allSession = (await getAllSession()).split("\n");
    const curName = ProjectReg.exec(projectPath)?.[1];

    if (allSession.includes(curName!)) {
      toast.style = Toast.Style.Success;
      toast.message = `Exist session ${curName} is open successfully`;

      await execCommand(`tmux switch -t ${curName}`);
    } else {
      // open vim
      toast.style = Toast.Style.Success;
      toast.message = `New session ${curName} is setup successfully`;

      await execCommand(`tmux new-session -d -s ${curName} -A`, `tmux switch -t ${curName}`);
      await openItermAndRun(`cd ${projectPath}`, "nvim");
    }

    setLoading(false);
    await closeMainWindow();
    await popToRoot();
  };

  const openProjectWithErrorHandler = async (data: FormData) => {
    try {
      return openProject(data);
    } catch (e) {
      console.log('catch e')
      if (isPermissionError(e)) {
        changeMode(PageMode.PermissionError);
      } else {
        changeMode(PageMode.UnexpectError);
        setErrorMsg((e as any).toString());
      }
    }
  };

  return (
    <>
      {pageMode === PageMode.Normal && (
        <Form
          isLoading={loading}
          actions={
            <ActionPanel>
              <Action.SubmitForm title="Open In Neovim" onSubmit={openProjectWithErrorHandler} />
              <Action title="Update All Repo" />
            </ActionPanel>
          }
        >
          <Form.Dropdown id="projectPath" title="Select Project" storeValue>
            {repoList.map((itm) => (
              <Form.Dropdown.Item key={itm.path} value={itm.path} title={itm.name} />
            ))}
          </Form.Dropdown>
        </Form>
      )}
      {pageMode === PageMode.PermissionError && <PermissionErrorScreen />}
      {pageMode === PageMode.UnexpectError && <GeneralErrorScreen reason={errorMsg} />}
    </>
  );
}
