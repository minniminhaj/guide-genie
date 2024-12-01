import { IMessages } from "./messages";

export interface IStep {
    description: string;
    pageUrl: string;
    pageIcon: string;
    domain: string;
    screenWidth: number;
    screenHeight: number;
    focalPointX: number;
    focalPointY: number;
    title: string;
    imgUri: string;
    eventType: string;
}

export interface IExtensionMessage<T> {
    action: IMessages;
    payload: T;
}