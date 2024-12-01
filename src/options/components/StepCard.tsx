import React, { useEffect, useState } from "react";
import "./StepCard.css";
import Skeleton from "react-loading-skeleton";
import { Link } from "@material-ui/core";
import { InsertLink, Launch, Navigation } from "@material-ui/icons";
export default ({ data, stepNumber, loading }) => {
  const [pointerCoordinates, setPointerCoordinates] = useState(null);
  useEffect(() => {}, []);
  const handleImageLoad = (event) => {
    const { height, width } = event.target;
    const pointerX = (data.focalPointX / data.screenWidth) * width;
    const pointerY = (data.focalPointY / data.screenHeight) * height;
    setPointerCoordinates({ pointerX, pointerY });
  };

  const getStepInfo = (stepData) => {
    if (loading) {
      return (
        <>
          <Skeleton /> <Skeleton count={2} />
        </>
      );
    }
    return (
      <>
        <div className="step-info-title">
          <h3>{stepData.title}</h3>
          {stepData.eventType === "navigation" && (
            <Link style={{ marginLeft: "5px" }} target="_blank" href={stepData.pageUrl}>
              <Launch fontSize="medium" />
            </Link>
          )}
        </div>
        <p>{stepData.description}</p>
      </>
    );
  };

  return (
    <div className="step-card">
      <div className="step-number">Step {stepNumber}</div>
      {getStepInfo(data)}
      {data.eventType !== "navigation" && (
        <div className="step-img-wrapper">
          <img onLoad={handleImageLoad} src={data.imgUri} alt="Step card" />
          {pointerCoordinates && (
            <span
              style={{
                left: `${pointerCoordinates.pointerX}px`,
                top: `${pointerCoordinates.pointerY}px`,
              }}
              className="step-img-pointer"
            ></span>
          )}
        </div>
      )}
    </div>
  );
};
