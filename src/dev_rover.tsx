import { Action, ActionPanel, closeMainWindow, Form, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { execCommand, getAllSession, openItermAndRun } from "./utils";
import { ErrorScreen, ErrorType } from "./pages/error";
import { Home } from './pages/home';

const ProjectReg = /\/([\w\s-_]+)\/$/;

interface IFormData {
  projectPath: string;
}

export default function Command() {
  const [errorInfo, changeErrorInfo] = useState<{ type: ErrorType; errorMsg?: string } | undefined>();

 
  return errorInfo?.type ? (
    <ErrorScreen type={errorInfo.type} errorMsg={errorInfo.errorMsg} />
  ) : (
    <Home onError={changeErrorInfo }/>
  );
}
