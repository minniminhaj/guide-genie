import { IMessages, StepEventTypes } from "../shared/messages";


export class BrowserEventListenerHandler {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        this.handleDOMContentLoaded = this.handleDOMContentLoaded.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    start() {
        document.addEventListener('click', this.handleClick, true);
        document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded);
        document.addEventListener('dblclick', this.handleDoubleClick);
        document.addEventListener('contextmenu', this.handleContextMenu);
        document.addEventListener('submit', this.handleSubmit);
        document.addEventListener('change', this.handleChange);
        document.addEventListener('focus', this.handleFocus);
        document.addEventListener('blur', this.handleBlur);
        document.querySelectorAll("[contenteditable='true']").forEach((ele: any) => {
            ele.addEventListener('blur', this.handleBlur);
        });
    }

    stop() {
        document.removeEventListener('click', this.handleClick, true);
        document.removeEventListener('DOMContentLoaded', this.handleDOMContentLoaded);
        document.removeEventListener('dblclick', this.handleDoubleClick);
        document.removeEventListener('contextmenu', this.handleContextMenu);
        document.removeEventListener('submit', this.handleSubmit);
        document.removeEventListener('change', this.handleChange);
        document.removeEventListener('focus', this.handleFocus);
        document.removeEventListener('blur', this.handleBlur);
        document.querySelectorAll("[contenteditable='true']").forEach(ele => {
            ele.removeEventListener('blur', this.handleBlur);
        });
    }

    handleDOMContentLoaded(event: Event) {
        // Your logic for the "DOMContentLoaded" event
    }

    handleClick(e: MouseEvent) {
        const stepPayload: any = BrowserEventListenerHandler.getEventStep(
            e,
            StepEventTypes.CLICK,
        );
        stepPayload.title = BrowserEventListenerHandler.mapStepTitleName(stepPayload, e);
        if (BrowserEventListenerHandler.checkElementId(e.target, 'asnap-recorded-btn')) {
            stepPayload.title = 'Completed';
        }
        //TODO: Fix this
        chrome.runtime.sendMessage({
            action: IMessages.BROWSER_EVENT,
            payload: stepPayload,
        });
        console.log(stepPayload);

    }

    handleDoubleClick(event: MouseEvent) {
        // console.log('Double-clicked!', event);
        // Your logic for the "dblclick" event
    }

    handleContextMenu(event: MouseEvent) {
        // console.log('Context menu opened!', event);
        // Your logic for the "contextmenu" event
    }

    handleSubmit(event: Event) {
        // console.log('Form submitted!', event);
        // Your logic for the "submit" event
    }

    handleChange(e: any) {
        if (
            e.target?.tagName === 'TEXTAREA' ||
            e.target?.tagName === 'INPUT' ||
            e.target.contentEditable === 'true'
        ) {
            const stepPayload: any = BrowserEventListenerHandler.getEventStep(
                e,
                StepEventTypes.BLUR,
            );
            stepPayload.title = BrowserEventListenerHandler.mapStepTitleName(stepPayload, e);
            chrome.runtime.sendMessage({
                action: IMessages.BROWSER_EVENT,
                payload: stepPayload,
            });
            console.log(stepPayload);
        }

        // Your logic for the "change" event
    }

    handleFocus(event: FocusEvent) {
        // console.log('Element focused!', event);
        // Your logic for the "focus" event
    }

    handleBlur(e: any) {
        if (
            e.target?.tagName === 'TEXTAREA' ||
            e.target?.tagName === 'INPUT' ||
            e.target.contentEditable === 'true'
        ) {
            const stepPayload: any = BrowserEventListenerHandler.getEventStep(
                e,
                StepEventTypes.BLUR,
            );
            stepPayload.title = BrowserEventListenerHandler.mapStepTitleName(stepPayload, e);
            chrome.runtime.sendMessage({
                action: IMessages.BROWSER_EVENT,
                payload: stepPayload,
            });
        }
    }

    static getEventStep(event: any, eventType: StepEventTypes) {
        if (!event) return;
        const pageTitle = document.title ?? 'No title available for this page'
        const pageDescription = (document.querySelector('meta[name="description"]') as any)?.content ?? 'No Description available for this page';
        const payload = {
            focalPointX: (event as MouseEvent).clientX ?? null,
            focalPointY: (event as MouseEvent).clientY ?? null,
            title: 'Click here',
            pageTitle,
            pageDescription,
            tagName: event.target.tagName,
            placeholder: `${event?.target?.name?.toUpperCase() ??
                event?.target?.placeholder ??
                event?.target?.id ??
                ''
                }`,
            eventType,
        };
        return payload;
    }

    static mapStepTitleName(payload: any, e: any) {
        const mapper: any = {
            BUTTON: () => `Click on ${e.target.textContent} Button`,
            TEXTAREA: () => {
                if (payload.eventType === StepEventTypes.BLUR) {
                    return `Type ${payload.placeholder} field`;
                }
                return 'Click on text field' + payload?.placeholder;
            },
            INPUT: () => {
                if (payload.eventType === StepEventTypes.BLUR) {
                    if ((e.currentTarget as HTMLInputElement).type === 'password') {
                        return `Enter password in ${payload?.placeholder} field`;
                    }
                    return `Type ${(e.target as HTMLInputElement).value
                        } in ${payload?.placeholder} field`;
                }
                return 'Click on text field ' + payload?.placeholder;
            },
            SELECT: () => 'Select from this dropdown',
            IMG: () => `Click on ${e.target.alt}`,
            A: () => `Navigate to different page by clicking here`
        };
        if (e.target?.tagName && mapper[e.target?.tagName]) {
            return mapper[e.target?.tagName]();
        }
        const innerText = e.target?.innerText?.trim();
        if (innerText?.length && payload.eventType === 'click') {
            if (innerText?.length < 100) {
                return 'Click on "' + innerText.slice(0, 24) + '"';
            }
            return BrowserEventListenerHandler.getClickedText(e);
        }

        if (payload.eventType === 'blur' && e.target.contentEditable === 'true') {
            return `Type "${innerText}"`;
        }
        return 'Click here';
    }

    static checkElementId(element: any, targetId: string) {
        // Check the element itself
        if (element.id === targetId) {
            return true;
        }

        // Traverse the DOM hierarchy to check ancestors
        let parentElement = element.parentNode;
        while (parentElement) {
            if (parentElement.id === targetId) {
                return true;
            }
            parentElement = parentElement.parentNode;
        }

        return false; // ID not found in the element or its ancestors
    }

    static getClickedText(event: MouseEvent): string {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);

        // Check if the clicked node is valid and a text node
        if (
            !range ||
            !range.startContainer ||
            range.startContainer.nodeType !== Node.TEXT_NODE
        ) {
            return 'Click here'; // Fallback for non-text clicks
        }

        const clickedNode = range.startContainer;
        const textContent = clickedNode.textContent || '';

        // Get the word under the clicked position
        const word = BrowserEventListenerHandler.extractWordAtOffset(
            textContent,
            range.startOffset,
        );

        // Check if the click is within the bounds of the word
        if (word && BrowserEventListenerHandler.isClickWithinTextBounds(event, range)) {
            return `Click on "${word}"`; // Return the word if valid
        }

        return 'Click here'; // Fallback if no valid word is found
    }

    static extractWordAtOffset(text: string, offset: number): string | null {
        const words = text.split(/\s+/); // Split by whitespace
        let cumulativeLength = 0;

        for (const word of words) {
            const wordStart = cumulativeLength;
            const wordEnd = cumulativeLength + word.length;

            // If the offset is within the current word
            if (offset >= wordStart && offset < wordEnd) {
                return word; // Return the exact word clicked
            }

            cumulativeLength += word.length + 1; // +1 for space
        }
        return null; // No word found
    }

    static isClickWithinTextBounds(event: MouseEvent, range: Range): boolean {
        const rects = range.getClientRects(); // Get the bounding rectangles for the range
        const rectArray = Array.from(rects);
        // Check each rectangle (in case the text spans multiple lines)
        for (const rect of rectArray) {
            if (event.clientX >= Math.floor(rect.x) && event.clientY >= Math.floor(rect.y)) {
                return true; // Click is within this word's bounding box
            }
        }

        return false; // Click is outside all bounding boxes
    }
}
