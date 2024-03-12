import { useState } from "react";
import { ErrorScreen, ErrorType } from "./pages/error";
import { Home } from "./pages/home";
import { ProjectConfig } from "./pages/projectConfig";

export default function Command() {
  const [errorInfo, changeErrorInfo] = useState<
    { type: ErrorType; errorMsg?: string } | undefined
  >();
  const [page, changePage] = useState<"HOME" | "CONFIG">("HOME");

  const curPage =
    page === "HOME" ? (
      <Home
        onError={changeErrorInfo}
        jumpToConfig={() => changePage("CONFIG")}
      ></Home>
    ) : (
      <ProjectConfig></ProjectConfig>
    );

  return errorInfo?.type ? (
    <ErrorScreen type={errorInfo.type} errorMsg={errorInfo.errorMsg} />
  ) : (
    curPage
  );
}
