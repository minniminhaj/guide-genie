import { Guide } from "./types";

const resolveText = async (title: string, translator: any): Promise<string> => {
    return translator.translate(title);
};

// Optimized function to process the entire Guide concurrently
export const processGuide = async (guide: Guide, targetLanguage: string): Promise<Guide> => {
    //@ts-ignore
    const translator = await (ai as any).translator.create({
        sourceLanguage: "en",
        targetLanguage: targetLanguage,
    });
    // Resolve steps' titles and descriptions concurrently

    const stepTasks = guide.steps.map(async (step) => {
        const [resolvedTitle, resolvedDescription] = await Promise.all([
            resolveText(step.title, translator),
            resolveText(step.description, translator),
        ]);
        return { title: resolvedTitle, description: resolvedDescription };
    });

    // Resolve guide title and description concurrently
    const guideTasks = Promise.all([
        resolveText(guide.guideTitle, translator),
        resolveText(guide.guideDescription, translator),
    ]);

    // Wait for all tasks to complete
    const [resolvedSteps, [resolvedGuideTitle, resolvedGuideDescription]] = await Promise.all([
        Promise.all(stepTasks),
        guideTasks,
    ]);

    return {
        ...guide,
        steps: resolvedSteps,
        guideTitle: resolvedGuideTitle,
        guideDescription: resolvedGuideDescription,
    };
};

export const downloadFullScreenshot = async (imgType) => {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollWidth = document.documentElement.scrollWidth;
    let currentY = 0;
    const images = [];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = scrollWidth;
    canvas.height = scrollHeight;

    const capturePart = async () => {
        if (currentY >= scrollHeight) {
            stitchImagesAndDownload(images, canvas, imgType);
            return;
        }

        // Scroll to the next section and wait for the rendering to stabilize
        window.scrollTo(0, currentY);

        await new Promise((resolve) => setTimeout(resolve, 300)); // Delay to allow the page to render

        chrome.tabs.captureVisibleTab({ format: imgType }, (imageData) => {
            const image = new Image();
            image.onload = function () {
                // Draw the captured part onto the canvas
                ctx.drawImage(
                    image,
                    0,
                    currentY,
                    image.width,
                    image.height,
                    0,
                    currentY,
                    image.width,
                    image.height
                );

                // Store the captured image data URL
                images.push(imageData);

                // Move down by the height of the viewport to capture the next part
                currentY += viewportHeight;

                // Continue capturing the next part
                capturePart();
            };
            image.src = imageData;
        });
    };

    capturePart();
};

const stitchImagesAndDownload = (images, canvas, imgType) => {
    if (images.length === 0) {
        console.error("No images captured.");
        return;
    }

    const context = canvas.getContext("2d");

    const firstImage = new Image();
    firstImage.onload = () => {
        canvas.width = firstImage.width;
        canvas.height = images.length * firstImage.height;

        let imagesLoaded = 0;

        const drawImageOnCanvas = (image, index) => {
            context.drawImage(image, 0, index * firstImage.height);
            imagesLoaded++;

            if (imagesLoaded === images.length) {
                const link = document.createElement("a");
                link.href = canvas.toDataURL(`image/${imgType}`);
                link.download = "full-page-screenshot." + imgType;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        images.forEach((dataUrl, index) => {
            const image = new Image();
            image.onload = () => drawImageOnCanvas(image, index);
            image.src = dataUrl;
        });
    };

    firstImage.src = images[0];
};
