import { IMessages } from "../shared/messages";

export interface ExtensionMessage<T> {
    action: string;
    payload: T;
}

export class ChromeExtensionUtils {
    public static searchTabs(query: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
        return chrome.tabs.query(query);
    }

    public static getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
        return chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0]);
    }

    public static sendMessageToTab(
        tabId: number,
        message: ExtensionMessage<string>,
    ): any {
        return chrome.tabs.sendMessage(tabId, message);
    }

    public static getBackgroundPage(): Promise<Window> {
        return new Promise(resolve => {
            chrome.runtime.getBackgroundPage(backgroundPage => {
                if (backgroundPage) resolve(backgroundPage);
            });
        });
    }

    public static captureScreen(
        options: chrome.tabs.CaptureVisibleTabOptions,
        windowId: number,
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(windowId, options, dataUrl => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve({ dataUrl });
                }
            });
        });
    }

    public static createTab(url: string): any {
        return chrome.tabs.create({ url });
    }

    public static updateTab(
        tabId: number,
        updateProperties: chrome.tabs.UpdateProperties,
    ): any {
        return chrome.tabs.update(tabId, updateProperties);
    }

    public static removeTab(tabId: number): any {
        return chrome.tabs.remove(tabId);
    }

    public static getExtensionUrl(path: string): string {
        return chrome.extension.getURL(path);
    }

    public static openOptionsPage(): void {
        chrome.runtime.openOptionsPage();
    }

    public static setBadgeText(text: string): void {
        chrome.action.setBadgeText({ text });
    }

    public static setBadgeBackgroundColor(color: string): void {
        chrome.action.setBadgeBackgroundColor({ color });
    }

    public static showNotification(
        options: chrome.notifications.NotificationOptions,
    ): void {
        // chrome.notifications.create(options);
    }

    // Other utility methods...

    // Example usage of utility methods
    public static async findActiveTabs(): Promise<chrome.tabs.Tab[]> {
        const activeTabs = await ChromeExtensionUtils.searchTabs({
            active: true,
        });
        return activeTabs;
    }

    static async removeContent() {
        try {
            const tabs = await ChromeExtensionUtils.searchTabs({});
            for (const tab of tabs) {
                new Promise(resolve => {
                    if (!tab.id) return;
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            action: IMessages.REMOVE_CONTENT,
                            payload: null,
                        },
                        () => {
                            resolve(true);
                        },
                    );
                });
            }
        } catch (error: any) {
            console.error('Error removing content:', error);
        }
    }
    // public static isContentScriptAvailable(tabId: number) {
    //     return new Promise((resolve, reject) => {
    //         chrome.scripting
    //             .executeScript({
    //                 target: { tabId },
    //                 func: () => {
    //                     //@ts-ignore
    //                     const isExtensionAvailable = document.querySelector(
    //                         'asnap-chrome-extension-content',
    //                     );
    //                     console.log(isExtensionAvailable, 'isExtensionAvailable');
    //                     return !!isExtensionAvailable;
    //                 },
    //             })
    //             .then((inject: any) => {
    //                 if (inject[0]?.result || inject?.result) {
    //                     resolve(true);
    //                 } else {
    //                     resolve(false);
    //                 }
    //             })
    //             .catch(e => resolve(false));
    //     });
    // }

    public static activateTab(tabId: number) {
        return chrome.tabs.update(tabId, { active: true });
    }
}
