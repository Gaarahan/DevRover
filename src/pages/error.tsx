import { Action, ActionPanel, Detail, environment, Icon } from "@raycast/api";

export enum ErrorType {
    PERMISSION = 'PERMISSION',
    GENERAL = 'GENERAL'
}

const OpenFullDiskAccessPreferencePaneAction = () => (
    <Action.Open
        title="Open System Preferences"
        icon={Icon.Gear}
        target="x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"
    />
);

const Actions = () => (
    <ActionPanel>
        <OpenFullDiskAccessPreferencePaneAction />
    </ActionPanel>
);

const permissionErrorMarkdown = `## Raycast needs automation access to iTerm.

1. Open **System Settings**
1. Open the **Privacy & Security** Preferences pane 
1. Then select the **Automation** tab
1. Expand **Raycast** from the list of applications
1. Ensure the **iTerm**  toggle is enabled as shown in the image below
1. When prompted enter your password
`;

export const PermissionErrorScreen = (props: { type: ErrorType, errorMsg: string }) => {
    if (props.type === ErrorType.PERMISSION) {
        return <Detail markdown={permissionErrorMarkdown} navigationTitle={"Permission Issue with Raycast"} actions={<Actions />} />
    } else {
        return <Detail markdown={`Unknown error: ${props.errorMsg}`} />
    }

};
