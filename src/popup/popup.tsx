import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "fontsource-roboto";
import "./popup.css";
import { Button, Fab, SvgIcon, ThemeProvider } from "@material-ui/core";
import { IMessages, RecordingStatus } from "../shared/messages";
import { LocalStorage } from "../utils/localStorage";
import { ChromeExtensionUtils } from "../utils/chromeExtentionCore";
import theme from "../utils/themeProvider";
import { PlayArrow, Stop } from "@material-ui/icons";
const App: React.FC<{}> = () => {
  const [recodingStatus, setRecodingStatus] = useState(RecordingStatus.NOT_STARTED);
  const handleStartRecording = async () => {
    chrome.tabs.query({}, (tabs) => {
      tabs.map((tab) => {
        chrome.tabs.sendMessage(tab?.id, {
          action: IMessages.START_RECORDING,
          payload: null,
        });
      });
    });
    await LocalStorage.setToLocalStorage({
      recordingStatus: RecordingStatus.IN_PROGRESS,
      steps: [],
    });
    window.close();
  };

  const handleStopRecording = async () => {
    await LocalStorage.setToLocalStorage({ recordingStatus: RecordingStatus.COMPLETED });
    setRecodingStatus(RecordingStatus.COMPLETED);
    (await ChromeExtensionUtils.searchTabs({})).forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        action: IMessages.COMPLETE_RECORDING,
        payload: null,
      });
    });
    chrome.runtime.openOptionsPage();
  };
  useEffect(() => {
    LocalStorage.getFromLocalStorage("recordingStatus").then((val) => setRecodingStatus(val));
  }, []);

  const getBtn = () => {
    if (recodingStatus === RecordingStatus.IN_PROGRESS) {
      return (
        <Fab
          onClick={handleStopRecording}
          style={{ padding: "15px 30px" }}
          color="secondary"
          variant="extended"
        >
          Stop Recording
          <Stop style={{ marginLeft: "6px" }} />
        </Fab>
      );
    }

    return (
      <Fab
        variant="extended"
        color="primary"
        onClick={handleStartRecording}
        style={{ color: "#fff", padding: "15px 30px" }}
      >
        Start Recording
        <PlayArrow style={{ marginLeft: "6px" }} />
      </Fab>
    );
  };

  return (
    <div className="popup">
      <img width="200" className="popup-logo" src="guide-genie.png" alt="guide-genie-logo" />
      {getBtn()}
    </div>
  );
};

const root = document.createElement("div");
root.classList.add("popup-root");
document.body.appendChild(root);
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  root
);
