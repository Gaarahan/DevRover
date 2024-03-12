import { useState } from "react";
import { ErrorScreen, ErrorType } from "./pages/error";
import { Home } from './pages/home';

export default function Command() {
  const [errorInfo, changeErrorInfo] = useState<{ type: ErrorType; errorMsg?: string } | undefined>();


  return errorInfo?.type ? (
    <ErrorScreen type={errorInfo.type} errorMsg={errorInfo.errorMsg} />
  ) : (
    <Home onError={changeErrorInfo }/>
  );
}
