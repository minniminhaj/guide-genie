import React, { useEffect, useState } from "react";
const RecordingTimer = ({ initialSeconds }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 700);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <div className="guide-genie-screen-start">
      {secondsLeft > 0 && <h1>Recording your guide in {secondsLeft}</h1>}
    </div>
  );
};

export default RecordingTimer;
