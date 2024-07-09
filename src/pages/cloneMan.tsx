import { Action, ActionPanel, Detail } from "@raycast/api";
import { PageEnum } from "../dev_rover";
import { IUpdateRes, getUpdateTasksByPath } from "../utils";
import { getConfig } from "./projectConfig";
import { useMemo, useState } from "react";

interface IProps {
  jumpToPage: (p: PageEnum) => void;
}
const pageTitle = '### UPDATE REPO'
const initPage = `
${pageTitle}

Use \`Cmd\` + \`Enter\` to start
`;

export function CloneMan({ jumpToPage }: IProps) {
  const [updateTasks, changeTask] = useState<
    {
      taskName: string;
      isMasterBranch: boolean;
      task: Promise<IUpdateRes>;
    }[]
  >([]);

  const markdownPage = useMemo(() => {
    if (!updateTasks.length) return initPage;

    return updateTasks.map(({taskName, isMasterBranch}) => `- **${taskName}** - ${isMasterBranch ? '\'master\'}`)
  }, [updateTasks]);

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
      <Detail
        markdown={markdownPage}
        navigationTitle="Update Repo"
        actions={
          <ActionPanel>
            <Action title="Update All Repo" onAction={updateAllRepo} />
            <Action
              title="Back To Home"
              onAction={() => jumpToPage(PageEnum.HOME)}
            />
          </ActionPanel>
        }
      />
    </>
  );
}
