# Guide Genie

## Introduction

Guide Genie is a powerful Chrome extension that simplifies the process of creating and translating product documentation. Here's how it works:

1. **Capture Screen Recordings**  
   Users can record their on-screen actions while navigating through their product.

2. **Generate Step-by-Step Guides**  
   Using AI, the tool analyzes the recording, identifies key actions, and generates detailed, easy-to-follow instructions.

3. **Translate with Ease**  
   The guides are instantly translated into multiple languages, making them accessible to a global audience.

---

## Steps

1. **Enable Gemini Nano AI**  
   Enable the Translator and Prompt APIs for AI functionality by following the official Chrome documents:

   - [Translator API Documentation](https://developer.chrome.com/docs/ai/translator-api)
   - [Prompt API Documentation](https://developer.chrome.com/docs/extensions/ai/prompt-api)

2. **Clone the Repository**  
   Clone the Guide Genie repository from GitHub:

   ```bash
   git clone https://github.com/minniminhaj/guide-genie.git

   ```

3. **Install NPM Packages**  
    Run the following command to install the required dependencies:

   ```bash
   npm install

   ```

4. **Build the Project**
   Compile the project by running:
   ```bash
   npm run build
   ```
5. **Load the Extension in Chrome**  
   Open Chrome and:

- Navigate to `chrome://extensions/`.
- Enable **Developer Mode** by toggling it in the top-right corner.
- Click the **Load Unpacked** button.
- Select the `/dist` folder from the project directory.
