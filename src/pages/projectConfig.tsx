import { Action, ActionPanel, Form } from "@raycast/api";

type projectConfig = {
  homePath: string;
};

const defaultConfig: projectConfig = { homePath: "~/Documents" };
let config = { ...defaultConfig };

export function ProjectConfig() {
  const changeConfig = (conf: projectConfig) => {
    config = conf;
  };
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Change Config" onSubmit={changeConfig} />
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
