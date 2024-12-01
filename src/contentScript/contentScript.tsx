import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { IMessages, RecordingStatus } from "../shared/messages";
import "./contentScript.css";
import { Button, ThemeProvider } from "@material-ui/core";
import { IExtensionMessage } from "../shared/interfaces";
import { BrowserEventListenerHandler } from "./browserEventHandler";
import RecordingTimer from "./components/RecordingTimer";
import { LocalStorage } from "../utils/localStorage";
import theme from "../utils/themeProvider";
const App: React.FC<{}> = () => {
  const initialCountdownSecounds = 3;
  const browserEventListenerHandler = new BrowserEventListenerHandler();
  const [recordingStatus, setRecordingStatus] = useState(IMessages.NOT_RECORDING);
  const handleMessages = (msg: IExtensionMessage<any>, res, sender) => {
    if (msg.action === IMessages.START_RECORDING) {
      setRecordingStatus(IMessages.START_RECORDING);
      setTimeout(() => {
        browserEventListenerHandler.start();
        setRecordingStatus(IMessages.IN_PROGRESS_RECORDING);
      }, initialCountdownSecounds * 700);
    }

    if (msg.action === IMessages.COMPLETE_RECORDING) {
      browserEventListenerHandler.stop();
    }
  };

  useEffect(() => {
    chrome.runtime.sendMessage(
      { action: IMessages.GET_RECORDING_STATUS, payload: null },
      (response) => {
        console.log(response);
        if (response?.recordingStatus === RecordingStatus.IN_PROGRESS) {
          browserEventListenerHandler.start();
        } else {
          browserEventListenerHandler.stop();
        }
      }
    );
    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);
  if (recordingStatus === IMessages.START_RECORDING) {
    return <RecordingTimer initialSeconds={initialCountdownSecounds} />;
  }
  if (recordingStatus === IMessages.IN_PROGRESS_RECORDING) {
    return <></>;
  }
  return <></>;
};

const root = document.createElement("guide-genie");
document.body.appendChild(root);

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  root
);
