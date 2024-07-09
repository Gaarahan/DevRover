import {
  Action,
  ActionPanel,
  closeMainWindow,
  Form,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import {
  execCommand,
  getAllSession,
  openItermAndRun,
} from "../utils";
import { ErrorType } from "./error";
import { getConfig } from "./projectConfig";
import { PageEnum } from "../dev_rover";

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
  jumpToPage: (p: PageEnum) => void;
}

export function Home(props: IProps) {
  const { onError, jumpToPage } = props;
  const [res, setRes] = useState<{ name: string; path: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  return (
    <>
      <Form
        navigationTitle="Rover Through Your Development Journey"
        isLoading={loading}
        actions={
          <ActionPanel>
            <Action.SubmitForm title="Open In Neovim" onSubmit={openProject} />
            <Action
              title="Change Project Config"
              onAction={() => jumpToPage(PageEnum.CONFIG)}
            ></Action>
            <Action
              title="Update All Repo"
              onAction={() => jumpToPage(PageEnum.CLONE_MAN)}
            />
          </ActionPanel>
        }
      >
        <Form.Description
          title="Search git repo from"
          text={getConfig("homePath")}
        />
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
    </>
  );
}
