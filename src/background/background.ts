import { IMessages, RecordingStatus } from "../shared/messages";
import { ChromeExtensionUtils } from "../utils/chromeExtentionCore";
import { LocalStorage } from "../utils/localStorage"
import { BackgroundRecordingHandler } from "./backgroundMessageHandler";


chrome.runtime.onInstalled.addListener(() => {
  //TODO: Add default values
  LocalStorage.setToLocalStorage({
    timeTaken: 0,
    steps: [],
    recordingStatus: RecordingStatus.NOT_STARTED,
  });
  ChromeExtensionUtils.searchTabs({}).then(tabs => {
    tabs.map((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"]
      })
      // chrome.scripting.insertCSS({
      //   target: { tabId: tab.id },
      //   files: ["contentScript.js"]
      // })
    })
  })
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.action) {
    case IMessages.START_RECORDING:
      BackgroundRecordingHandler.startRecording(msg, sender, sendResponse);
      break;
    case IMessages.COMPLETE_RECORDING:
      BackgroundRecordingHandler.completeRecording(msg, sender, sendResponse);
      break;
    case IMessages.PAUSE_RECORDING:
      BackgroundRecordingHandler.pauseRecording(msg, sender, sendResponse);
      break;
    case IMessages.BROWSER_EVENT:
      BackgroundRecordingHandler.handleBrowserEvent(msg, sender, sendResponse);
      break;
    case IMessages.PAGE_NAVIGATION:
      BackgroundRecordingHandler.handlePageNavigation(msg, sender, sendResponse);
      break;
    case IMessages.GET_RECORDING_STATUS:
      BackgroundRecordingHandler.getRecordingStatus(msg, sender, sendResponse);
      break;

    default:
      break;
  }
  return true
})

