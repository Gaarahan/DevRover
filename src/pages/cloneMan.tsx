import { Action, ActionPanel, Detail } from "@raycast/api";
import { PageEnum } from "../dev_rover";
import { IUpdateRes, IUpdateTask, getUpdateTasksByPath } from "../utils";
import { getConfig } from "./projectConfig";
import { useEffect, useState } from "react";

interface IProps {
  jumpToPage: (p: PageEnum) => void;
}
const pageTitle = "### UPDATE REPO";
const operateTip = `
1. Use \`Enter\` to start update all **master** repo

1. Use \`Cmd\` + \`Enter\` to start update all repo
`;
const initPage = `
${pageTitle}
${operateTip}
Repo list initializing...
`;

export function CloneMan({ jumpToPage }: IProps) {
  const [updateTasks, changeTask] = useState<IUpdateTask[]>([]);
  const [pendingTask, changPendingTask] = useState<Promise<
    IUpdateRes[]
  > | null>();
  const [markdownPage, changeMarkdownPage] = useState<string>(initPage);

  const getAllUpdateList = async () => {
    const homePath = getConfig("homePath");
    const tasks = await getUpdateTasksByPath(homePath);
    changeTask(tasks);
    changeMarkdownPage(
      [
        pageTitle,
        operateTip,
        tasks.map((itm) => itm.taskDescMarkdown).join("\n"),
      ].join("\n"),
    );
  };

  useEffect(() => {
    void getAllUpdateList();
  }, []);

  const updateAllRepo = async () => {
    if (pendingTask || !updateTasks.length) return;

    const newPendingTask = Promise.all(updateTasks.map((itm) => itm.runner()));
    changPendingTask(newPendingTask);
    changeMarkdownPage([pageTitle, `Updating...`].join("\n"));
    newPendingTask.then((res) => {
      const successTask: string[] = [];
      const failTask: { desc: string; errorMsg: string }[] = [];
      res.forEach(({ success, msg }, index) => {
        if (success) {
          successTask.push(updateTasks[index].path);
        } else {
          const desc = updateTasks[index].taskDescMarkdown;
          failTask.push({
            desc,
            errorMsg: msg,
          });
        }
      });

      const successStr = `> SUCCESS: ${successTask.join(", ")}`;
      const failStr = failTask
        .map((itm) => `${itm.desc}\n\n${itm.errorMsg}`)
        .join("\n");
      changPendingTask(null);
      changeMarkdownPage(
        [pageTitle, failStr, successStr].join("\n"),
      );
    });
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
