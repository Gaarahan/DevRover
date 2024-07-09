import { Action, ActionPanel, Form, Toast, showToast } from "@raycast/api";
import path from "node:path";
import { PageEnum } from "../dev_rover";

type projectConfig = {
  homePath: string;
};

const defaultConfig: projectConfig = {
  homePath: path.join(process.env.HOME!, "Documents/"),
};
let config = { ...defaultConfig };

interface IProps {
  jumpToPage: (p: PageEnum) => void;
}

export function ProjectConfig({ jumpToPage }: IProps) {
  const changeConfig = async (conf: projectConfig) => {
    config = conf;

    const toast = await showToast({
      style: Toast.Style.Success,
      title: "Success",
    });
    setTimeout(() => {
      toast.hide();
    }, 2000);
  };
  return (
    <Form
      navigationTitle="Perference"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Change Config" onSubmit={changeConfig} />
          <Action
            title="Back To Home"
            onAction={() => jumpToPage(PageEnum.HOME)}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="homePath"
        title="Search Project From"
        storeValue
        defaultValue={config.homePath}
      />
    </Form>
  );
}

export function getConfig(key: keyof projectConfig) {
  return config[key];
}
