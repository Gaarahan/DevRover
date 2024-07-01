import { useState } from "react";
import { ErrorScreen, ErrorType } from "./pages/error";
import { Home } from "./pages/home";
import { ProjectConfig } from "./pages/projectConfig";
import { CloneMan } from "./pages/cloneMan";

export enum PageEnum {
  HOME = "HOME",
  CONFIG = "CONFIG",
  CLONE_MAN = "CLONE_MAN",
}

export default function Command() {
  const [errorInfo, changeErrorInfo] = useState<
    { type: ErrorType; errorMsg?: string } | undefined
  >();
  const [page, changePage] = useState<PageEnum>(PageEnum.HOME);

  if (errorInfo?.type) {
    return <ErrorScreen type={errorInfo.type} errorMsg={errorInfo.errorMsg} />;
  }

  switch (page) {
    case PageEnum.HOME:
      return (
        <Home
          onError={changeErrorInfo}
          jumpToPage={changePage}
        ></Home>
      );
    case PageEnum.CONFIG:
      return <ProjectConfig jumpToPage={changePage} />;
    case PageEnum.CLONE_MAN:
      return <CloneMan jumpToPage={changePage} />;
  }
}
