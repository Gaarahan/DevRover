import {
  Action,
  ActionPanel,
  closeMainWindow,
  Detail,
  Form,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  execCommand,
  getAllSession,
  openItermAndRun,
  getUpdateTasksByPath,
  IUpdateRes,
} from "../utils";
import { ErrorType } from "./error";
import { getConfig } from "./projectConfig";

const ProjectReg = /\/([\w\s-_]+)\/$/;

interface IFormData {
  projectPath: string;
}

type ErrorInfo = {
  type: ErrorType;
  errorMsg?: string;
};

export interface IProps {
  onError: (e: ErrorInfo) => void;
  jumpToConfig: () => void;
}

export function Home(props: IProps) {
  const { onError, jumpToConfig } = props;
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updateTasks, changeTask] = useState<
    {
      taskName: string;
      isMasterBranch: boolean;
      task: Promise<IUpdateRes>;
    }[]
  >([]);

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
        await execCommand(
          `tmux new-session -d -s ${curName} -A -c ${projectPath}`,
        );
        await execCommand(`tmux switch -t ${curName}`);
        await openItermAndRun("nvim");
      }
      setTimeout(async () => await closeMainWindow(), 1000);
    } catch (e: any) {
      if (e.stderr?.includes?.("-1743")) {
        onError({ type: ErrorType.PERMISSION });
      } else {
        onError({ type: ErrorType.GENERAL, errorMsg: e.toString() });
      }
    }

    setLoading(false);
  };

  const updateAllRepo = async () => {
    const homePath = getConfig("homePath");
    const tasks = await getUpdateTasksByPath(homePath);
    // TODO
    const updateTasks = tasks.map(({ path, isMasterBranch, runner }) => ({
      taskName: path,
      isMasterBranch,
      task: runner as any,
    }));
    changeTask(updateTasks);
  };

  return (
    <>
      <Form
        isLoading={loading}
        actions={
          <ActionPanel>
            <Action.SubmitForm title="Open In Neovim" onSubmit={openProject} />
            <Action
              title="Change Project Config"
              onAction={jumpToConfig}
            ></Action>
            <Action title="Update All Repo" onAction={updateAllRepo} />
          </ActionPanel>
        }
      >
        <Form.Dropdown id="projectPath" title="Select Project" storeValue>
          {res.map((itm) => (
            <Form.Dropdown.Item
              key={itm.path}
              value={itm.path}
              title={itm.name}
            />
          ))}
        </Form.Dropdown>
      </Form>
      {updateTasks.length ? (
        <Detail markdown={JSON.stringify(updateTasks)}></Detail>
      ) : null}
    </>
  );
}
