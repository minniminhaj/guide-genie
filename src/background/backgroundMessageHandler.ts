import { IMessages, RecordingStatus, StepEventTypes } from "../shared/messages";
import { ChromeExtensionUtils } from "../utils/chromeExtentionCore";
import { LocalStorage } from "../utils/localStorage";

export class BackgroundRecordingHandler {
    constructor() { }

    public static async startRecording(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        await LocalStorage.setToLocalStorage({
            recordingStatus: RecordingStatus.IN_PROGRESS,
            timeTaken: 0,
            startTime: 0,
            pausedTime: 0,
            steps: [],
        });
        await BackgroundRecordingHandler.installScript();
        // await UserEngagementTracker.startRecording();
        sendResponse({});
        return true;
    }

    public static async pauseRecording(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        // await UserEngagementTracker.pauseRecording();
        await LocalStorage.setToLocalStorage({
            recordingStatus: RecordingStatus.PAUSED,
        });
        sendResponse({});
        return true;
    }

    public static async completeRecording(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        await LocalStorage.setToLocalStorage({
            recordingStatus: RecordingStatus.COMPLETED,
        });
        await ChromeExtensionUtils.removeContent();
        chrome.runtime.openOptionsPage();
        // const timeTaken = await UserEngagementTracker.calculateTimeSpent();
        // await LocalStorage.setToLocalStorage({ timeTaken });
        sendResponse({});
        return true;
    }

    public static async handleBrowserEvent(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        if (!BackgroundRecordingHandler.isRecordingInProgress) return;

        const imgUri = await ChromeExtensionUtils.captureScreen(
            {
                quality: 1,
                format: 'png',
            },
            (sender?.tab as chrome.tabs.Tab).windowId as number,
        );
        const step = BackgroundRecordingHandler.buildStep(
            request.payload,
            sender.tab as chrome.tabs.Tab,
            imgUri?.dataUrl,
        );
        step.pageTitle = sender.tab.title;
        const currentSteps: any[] = await LocalStorage.getFromLocalStorage('steps');
        const lastStep = currentSteps.slice(-1)[0];
        if (!lastStep || lastStep?.domain !== step?.domain) {
            await BackgroundRecordingHandler.handlePageNavigation(
                {
                    action: IMessages.PAGE_NAVIGATION,
                    payload: sender.tab,
                },
                sender,
                sendResponse,
            );
        }
        await BackgroundRecordingHandler.addStepToStorage(step);
        sendResponse({});
        return true;
    }

    public static async addStepToStorage(step: any) {
        const currentSteps: any[] = await LocalStorage.getFromLocalStorage('steps');
        currentSteps?.push(step);
        await LocalStorage.setToLocalStorage({ steps: currentSteps ?? [] });
        chrome.action.setBadgeText({ text: currentSteps.length.toString() });
    }

    public static async handlePageNavigation(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        if (!request.payload) return;
        const step = BackgroundRecordingHandler.buildStep(
            { eventType: StepEventTypes.NAVIGATION, title: 'Navigate to this page' },
            request.payload as chrome.tabs.Tab,
            null,
        );
        await BackgroundRecordingHandler.addStepToStorage(step);
        sendResponse({});
    }

    public static async getRecordingStatus(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        const recordingStatus = await LocalStorage.getFromLocalStorage('recordingStatus');
        sendResponse({ recordingStatus });
    }

    public static async sendGuide(
        request: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        const steps: Array<any> =
            await LocalStorage.getFromLocalStorage('steps');
        const title = BackgroundRecordingHandler.getDefaultGuideTitle(steps[0]?.domain ?? '');
        sendResponse({ steps, title, source: 'CHROME_EXTENSION' });
    }

    public static async installScript() {
        const excludedUrl = [
            'chrome://',
            'https://chrome.google.com/webstore',
            'brave://extensions',
            'http://localhost',
            'https://chromewebstore.google.com/',
        ];
        const tabList = await ChromeExtensionUtils.searchTabs({});
        const getExcludedUrl = (tabId: any, tabUrl: any) => {
            const isExculudedUrl = excludedUrl.some(url => (tabUrl ?? '').startsWith(url));
            if (isExculudedUrl) return false;
            if (!tabId) return false;
            return true;
        };
        try {
            await LocalStorage.setToLocalStorage({ steps: [] });
            tabList.map(async tab => {
                const excludeUrl = getExcludedUrl(tab.id, tab.url);
                if (!excludeUrl) return;
                await BackgroundRecordingHandler.installScriptAndStyles(tab.id as number);
            });
        } catch (error) {
            console.error(error);
        }

        // chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        //   const excludeUrl = getExcludedUrl(tabId, tab.url);
        //   if (!excludeUrl) return;
        //   await GuideRecordingHandler.installScriptAndStyles(tabId);
        // });

        // chrome.tabs.onCreated.addListener(async tab => {
        //   const excludeUrl = getExcludedUrl(tab.id as number, tab.url);
        //   if (!excludeUrl) return;
        //   await GuideRecordingHandler.installScriptAndStyles(tab.id as number);
        // });
        chrome.webNavigation.onCompleted.addListener(async tab => {
            const excludeUrl = getExcludedUrl(tab.tabId, tab.url);
            if (!excludeUrl) return;
            await BackgroundRecordingHandler.installScriptAndStyles(tab.tabId);
        });
    }

    protected static buildStep(
        event: any,
        tab: chrome.tabs.Tab,
        imgUri: string | null,
    ): any {
        const step: any = {
            description: '',
            pageUrl: tab?.url ?? '',
            pageIcon: tab?.favIconUrl ?? '',
            domain: tab?.url ? new URL(tab?.url ?? '')?.hostname : '',
            imgUri,
            screenWidth: tab.width ?? 0,
            screenHeight: tab.height ?? 0,
            ...event,
        };
        return step;
    }

    protected static getDefaultGuideTitle(hostname: string): string {
        if (!hostname) return 'Step by step guide for this Page';
        const hostnameParts = hostname.split('.').slice(-2, -1);
        return `Step by step guide for ${hostnameParts.join('') ?? 'page'}`;
    }

    static async installScriptAndStyles(tabId: number) {
        const isRecordingInProgress = await BackgroundRecordingHandler.isRecordingInProgress();
        if (!isRecordingInProgress) return;
        chrome.tabs.sendMessage(tabId, {
            action: IMessages.START_BROWSER_EVENT,
            payload: null,
        });
        // const isScriptAvailable = await ChromeExtensionUtils.isContentScriptAvailable(tabId);
        // const isInjected = await this.isTabAlreadyInjected(tabId);
        // if (isScriptAvailable) {
        //   chrome.tabs.sendMessage(tabId, {
        //     action: MessageEvents.REMOVE_CONTENT,
        //     payload: null,
        //   });
        //   chrome.tabs.sendMessage(tabId, {
        //     action: MessageEvents.START_BROWSER_EVENT,
        //     payload: null,
        //   });
        //   return;
        // }
        // await new Promise(res => {
        //     chrome.tabs.sendMessage(
        //         tabId,
        //         {
        //             action: IMessages.CHECK_STATUS,
        //             payload: null,
        //         },
        //         async response => {
        //             //TODO: Fix this
        //             // if (!response) {
        //             //     await ScriptInjector.executeScript(tabId, ['content-scripts.js']);
        //             //     await ScriptInjector.insertCSS(tabId, ['assets/styles/content.css']);
        //             //     await chrome.tabs.sendMessage(tabId, {
        //             //         action: Image.START_BROWSER_EVENT,
        //             //         payload: null,
        //             //     });
        //             //     // await this.markTabAsInjected(tabId);
        //             //     res(true);
        //             // } else {
        //             //     chrome.tabs.sendMessage(tabId, {
        //             //         action: MessageEvents.START_BROWSER_EVENT,
        //             //         payload: null,
        //             //     });
        //             //     // await this.markTabAsInjected(tabId);
        //             //     res(true);
        //             // }
        //         },
        //     );
        // });
        // await ScriptInjector.executeScript(tabId, ['content-scripts.js']);
        // await ScriptInjector.insertCSS(tabId, ['assets/styles/content.css']);
        // chrome.tabs.sendMessage(tabId, {
        //   action: MessageEvents.START_BROWSER_EVENT,
        //   payload: null,
        // });
        // await this.markTabAsInjected(tabId);
    }

    static async isRecordingInProgress() {
        const recordingStatus =
            await LocalStorage.getFromLocalStorage('recordingStatus');
        return recordingStatus === RecordingStatus.IN_PROGRESS;
    }

    static async validateScriptInstalltion(tab: any) {
        const excludedUrl = ['chrome://', 'https://chrome.google.com/webstore', 'localhost'];
        const isExculudedUrl = excludedUrl.some(url => (tab.url ?? '').startsWith(url));
        if (isExculudedUrl) return true;
        const isRecording = await BackgroundRecordingHandler.isRecordingInProgress();
        if (!isRecording) return true;
        return false;
    }


}
