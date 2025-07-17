import React, { useEffect, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";

const TeachableWebcam = () => {
  const URL = "https://teachablemachine.withgoogle.com/models/nzdPIHSfH/"; // <- Thay bằng model URL của bạn
  const [prediction, setPrediction] = useState("Đang tải model...");
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const webcamInstanceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      const model = await tmImage.load(modelURL, metadataURL);
      modelRef.current = model;

      const webcam = new tmImage.Webcam(200, 200, true); // width, height, flip
      await webcam.setup();
      await webcam.play();

      webcamRef.current.appendChild(webcam.canvas);
      webcamInstanceRef.current = webcam;

      predictLoop();
    };

    const predictLoop = async () => {
      webcamInstanceRef.current.update();
      const predictionList = await modelRef.current.predict(webcamInstanceRef.current.canvas);
      const top = predictionList.reduce((a, b) => (a.probability > b.probability ? a : b));
      setPrediction(`${top.className} (${(top.probability * 100).toFixed(2)}%)`);
      rafRef.current = requestAnimationFrame(predictLoop);
    };

    init();

    return () => {
      if (webcamInstanceRef.current) {
        webcamInstanceRef.current.stop();
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div>
      <h2>Teachable Machine với Vite + React</h2>
      <div ref={webcamRef}></div>
      <p>Kết quả dự đoán: {prediction}</p>
    </div>
  );
};

export default TeachableWebcam;
