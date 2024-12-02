import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  Grid,
  Menu,
  MenuItem,
  Switch,
  TextField,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import "react-loading-skeleton/dist/skeleton.css";
import "fontsource-roboto";
import "./options.css";
import { LocalStorage } from "../utils/localStorage";
import StepCard from "./components/StepCard";
import { IMessages } from "../shared/messages";
import theme from "../utils/themeProvider";
import CustomDropdownMenu from "./components/CustomDropdownMenu";
import Skeleton from "react-loading-skeleton";
import Header from "./components/Header";
import Steps from "./components/Steps";
import { downloadFullScreenshot, processGuide } from "./util";
import { Snackbar } from "@material-ui/core";

const App: React.FC<{}> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(null);
  const [steps, setSteps] = useState([]);
  const [orgSteps, setOrgSteps] = useState([]);
  const [guide, setGuide] = useState(null);
  const [translatationSupport, setTranslationSupport] = useState<boolean>(true);
  const [orgGuide, setOrgGuide] = useState(null);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const languageList = [
    { label: "en", display: "English" },
    { label: "es", display: "Spanish" },
    { label: "ja", display: "Japanese" },
    { label: "hi", display: "Hindi" },
    { label: "zh", display: "Chinese" },
    { label: "ru", display: "Russian" },
    { label: "bn", display: "Bengali" },
    { label: "fr", display: "French" },
  ];

  const downloadList = [
    { label: "png", display: "Png Image" },
    { label: "jpeg", display: "JPEG Image" },
  ];
  const [selectedLang, setSelectedLang] = useState(languageList[0]);
  const handleTranslateMenuClick = async (event) => {
    setSelectedLang(event);
    if (event.label === "en") {
      setSteps(orgSteps);
      setGuide(orgGuide);
      return;
    }
    setIsLoading(true);
    const updatedSteps = orgSteps.map(({ title, description }) => ({ title, description }));
    try {
      console.time("Translator API Time:");
      const {
        steps: processedSteps,
        guideDescription,
        guideTitle,
      } = await processGuide(
        {
          guideDescription: orgGuide.guideDescription,
          guideTitle: orgGuide.guideTitle,
          steps: updatedSteps,
        },
        event.label
      );
      console.timeEnd("Translator API Time:");
      setSteps((steps) =>
        steps.map((step, index) => ({
          ...step,
          title: processedSteps[index].title,
          description: processedSteps[index].description,
        }))
      );
      setGuide({ guideDescription, guideTitle });
      setIsLoading(false);
    } catch (error) {
      setSnackbarState({
        open: true,
        message: "Gemini nano translator API failed, please enable the API",
        severity: "error",
      });
      console.error("Translator API Failed:" + error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //@ts-ignore
    LocalStorage.getFromLocalStorage("steps").then((localSteps) => {
      addSteps(localSteps);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === IMessages.COMPLETE_RECORDING) {
        LocalStorage.getFromLocalStorage("steps").then((localSteps) => {
          addSteps(localSteps);
          setIsLoading(true);
        });
      }
    });

    //@ts-ignore
    if ("translation" in self && "createTranslator" in self.translation) {
      setTranslationSupport(true);
    }
  }, []);

  const addSteps = async (steps) => {
    console.log(steps);
    if (!steps.length) {
      setIsLoading(false);
      return;
    }
    setGuide({
      guideTitle: `Step by step guide for ${steps[0].domain} page`,
      guideDescription: "Provides detail overview of step ",
    });
    setOrgSteps(steps);
    setOrgGuide({
      guideTitle: `Step by step guide for ${steps[0].domain} page`,
      guideDescription: "Provides detail overview of step ",
    });
    setSteps(steps);
    try {
      //@ts-ignore
      const session = await (ai as any).languageModel.create({
        systemPrompt: `Generate a step-by-step guide from the provided JSON input, ensuring the output strictly matches the expected format. The output must contain exactly ${steps.length} steps, matching the number and order of interactions in the input. Each step must align with the interaction at the same index and context. The output format is as follows: { "guideTitle": "string", "guideDescription": "string", "steps": [ { "title": "string", "description": "string" } ] }. Ensure relevance, accuracy, and strict adherence to this format.`,
      });
      const stepsWithoutImg = steps.map(
        ({ title, eventType, tagName, pageTitle, pageDescription, domain }: any) => ({
          title,
          domain,
          eventType,
          tagName,
          pageTitle,
          pageDescription,
        })
      );
      console.time("PROMPT API Time:");
      const result = await session.prompt(JSON.stringify(stepsWithoutImg));
      console.timeEnd("PROMPT API Time:");
      console.log(result);
      const { guideTitle, guideDescription, steps: updatedSteps } = JSON.parse(result);
      console.log(updatedSteps);

      const stepsWithAIContent = updatedSteps?.map((aiStep, index) => ({
        ...steps[index],
        description: aiStep.description,
        title: aiStep.title,
      }));
      setGuide({ guideTitle, guideDescription });
      setSteps(stepsWithAIContent);
      setOrgSteps(stepsWithAIContent);
      setOrgGuide({ guideTitle, guideDescription });
    } catch (error) {
      setSnackbarState({
        open: true,
        message: "Gemini nano prompt API failed, please enable the API",
        severity: "error",
      });
      console.error("PROMPT API Failed:" + error);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const handleDownload = async (event) => {
    setDownloading(true);
    switch (event.label) {
      case "png":
        setDownloading(true);
        downloadFullScreenshot("png");
        break;
      case "jpeg":
        setDownloading(true);
        downloadFullScreenshot("jpeg");
        break;
      case "html":
        console.log("html");
        // downloadImage("jpeg");
        break;
      case "json":
        console.log("json");
        // downloadImage("jpeg");
        break;
      default:
        break;
    }
    setDownloading(false);
  };
  const handleSnackbarClose = () => {
    setSnackbarState({ open: false, message: "", severity: "success" });
  };
  const getHeader = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton /> <Skeleton count={2} />
        </>
      );
    }
    return (
      <>
        <h2>{guide.guideTitle}</h2>
        <p>{guide.guideDescription}</p>
      </>
    );
  };

  return (
    <div>
      <Header
        languageList={languageList}
        downloadList={downloadList}
        onDownload={handleDownload}
        onLanguageSelect={handleTranslateMenuClick}
        isLoading={isLoading}
        selectedLang={selectedLang}
      />
      {steps.length || isLoading ? (
        <div className="guide">
          <div className="guide-header">{getHeader()}</div>
          <Steps loading={isLoading} steps={steps} />
        </div>
      ) : (
        <h2 className="no-steps-title">No Steps added</h2>
      )}
      <Snackbar open={snackbarState.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        {/* <Alert onClose={handleSnackbarClose} severity={snackbarState.severity}>
          This is a success message!
        </Alert> */}
        <div className={`snackbar ${snackbarState.severity}`}>{snackbarState.message}</div>
      </Snackbar>
    </div>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  root
);
