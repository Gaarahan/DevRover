import { useState } from "react";
import { ErrorScreen, ErrorType } from "./pages/error";
import { Home } from "./pages/home";
import { ProjectConfig } from "./pages/projectConfig";

enum PageEnum {
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
    case "HOME":
      return (
        <Home
          onError={changeErrorInfo}
          jumpToConfig={() => changePage(PageEnum.CONFIG)}
        ></Home>
      );
    case "CONFIG":
      return <ProjectConfig jumpToHome={() => changePage(PageEnum.HOME)} />;
  }
}
