import { Action, ActionPanel, Form, Toast, showToast } from "@raycast/api";
import path from "node:path";

type projectConfig = {
  homePath: string;
};

const defaultConfig: projectConfig = { homePath: path.join(process.env.HOME!, 'Documents/') };
let config = { ...defaultConfig };

interface IProps {
  jumpToHome: () => void;
}

export function ProjectConfig({ jumpToHome }: IProps) {
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
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Change Config" onSubmit={changeConfig} />
          <Action title="Back To Home" onAction={jumpToHome} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="homePath"
        title="Select Project"
        storeValue
        defaultValue={config.homePath}
      />
    </Form>
  );
}

export function getConfig(key: keyof projectConfig) {
  return config[key];
}
