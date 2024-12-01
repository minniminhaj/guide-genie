export class LocalStorage {
    constructor() { }
    public static getFromLocalStorage(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.get(key, result => {
                    if (result[key]) {
                        return resolve(result[key]);
                    }
                    resolve(null);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    public static setToLocalStorage(data: { [key: string]: any }): Promise<void> {
        return new Promise(resolve => {
            chrome.storage.local.set(data, () => {
                resolve();
            });
        });
    }

    public static clearFromLocalStorage(keys: string[]): Promise<void> {
        return new Promise(resolve => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            });
        });
    }

    public static async performAction(action: string, data?: any): Promise<void> {
        switch (action) {
            case 'get':
                const value = await this.getFromLocalStorage(data);
                console.log('Retrieved value:', value);
                return value;
            case 'set':
                await this.setToLocalStorage(data);
                console.log('Data stored in local storage');
                break;
            case 'remove':
                await this.clearFromLocalStorage(data);
                console.log('Data removed from local storage');
                break;
            default:
                console.log('Invalid action');
        }
    }

    public static async clearLocalStorage(): Promise<void> {
        await this.clearFromLocalStorage([]);
    }

    public static async getAllKeys(): Promise<string[]> {
        return new Promise(resolve => {
            chrome.storage.local.get(null, result => {
                const keys = Object.keys(result);
                resolve(keys);
            });
        });
    }

    public static async getAllData(): Promise<{ [key: string]: any }> {
        return new Promise(resolve => {
            chrome.storage.local.get(null, result => {
                resolve(result);
            });
        });
    }
}
