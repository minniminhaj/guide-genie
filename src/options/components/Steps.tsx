import React from "react";
import StepCard from "./StepCard";
import { GuideStep } from "../types";

interface StepsProps {
  steps: GuideStep[];
  loading: boolean;
}

const Steps: React.FC<StepsProps> = ({ steps, loading }) => {
  return (
    <div className="guide-steps">
      {steps.length > 0
        ? steps.map((step, index) => (
            <StepCard key={index} loading={loading} stepNumber={index + 1} data={step} />
          ))
        : "No steps available"}
    </div>
  );
};

export default Steps;
