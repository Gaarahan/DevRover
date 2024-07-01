import { Detail } from "@raycast/api";
import { PageEnum } from "../dev_rover";

interface IProps {
  jumpToPage: (p: PageEnum) => void;
}

export function CloneMan({ jumpToPage }: IProps) {
  return <Detail markdown="##CLONE_MAN" navigationTitle="Update Repo" />;
}
