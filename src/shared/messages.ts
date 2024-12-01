export enum IMessages {
  TOGGLE_OVERLAY,
  START_RECORDING,
  START_BROWSER_EVENT,
  COMPLETE_RECORDING,
  NOT_RECORDING,
  IN_PROGRESS_RECORDING,
  PAUSE_RECORDING,
  CREATE_GUIDE,
  BROWSER_EVENT,
  REMOVE_CONTENT,
  PAGE_NAVIGATION,
  GET_RECORDING_STATUS,
  SEND_GUIDE_DATA,
  SEND_GUIDE_SUCCESS,
  GET_AUTH,
  REMOVE_AUTH,
}

export enum RecordingStatus {
  NOT_STARTED = 'notStarted',
  COMPLETED = 'completed',
  IN_PROGRESS = 'inProgress',
  PAUSED = 'paused',
}

export enum StepEventTypes {
  NAVIGATION = 'navigation',
  CLICK = 'click',
  BLUR = 'blur',
  MANUAL_TITLE = 'manual_title',
  MANUAL_IMAGE = 'manual_image',
  MANUAL_IMAGE_CLICK = 'manual_image_click',
}