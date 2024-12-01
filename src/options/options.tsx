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
const App: React.FC<{}> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(null);
  const [steps, setSteps] = useState([]);
  const [orgSteps, setOrgSteps] = useState([]);
  const [guide, setGuide] = useState(null);
  const [translatationSupport, setTranslationSupport] = useState<boolean>(true);
  const [aiGenSupport, setAiGenSupport] = useState<boolean>(true);
  const [orgGuide, setOrgGuide] = useState(null);
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
      console.error("Language Translation API Failed:" + error);
      setIsLoading(true);
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
    // @ts-ignore
    const aiAvailable = (await ai.languageModel?.capabilities()).available;
    if (aiAvailable !== "readily") {
      setAiGenSupport(false);
      setIsLoading(false);
      return;
    }
    // @ts-ignore
    const session = await (ai as any).languageModel.create({
      systemPrompt: "Alway generate a step by step guide in JSON format",
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
    console.time("AI");
    try {
      const result = await session.prompt(` 
Generate a step-by-step guide from the provided JSON. Each interaction in the input must correspond exactly to one step in the output. The number of steps in the output must match the number of interactions in the input JSON which is ${
        steps.length
      } in total, with each step corresponding to the interaction at the same index of input. Write a detailed title & description for each step that explains the user's action based on the interaction, including details such as eventType, tagName, domain, and pageUrl. Ensure the description is specific and relevant to the interaction. Do not skip any interactions or add extra steps.
Return only the following JSON structure as the output: { "guideTitle": "string", "guideDescription": "string", "steps": [ { "title": "string", "description": "string" } ] }
    
    ${JSON.stringify(stepsWithoutImg)}`);
      console.timeEnd("AI");
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
      console.error("NOT AI GENERATED STEPS, ERROR:" + error);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const handleDownload = async (event) => {
    console.log(event);
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
      <div className="guide">
        <div className="guide-header">{getHeader()}</div>
        <Steps loading={isLoading} steps={steps} />
      </div>
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
