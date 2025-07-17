import React, { useEffect, useRef, useState } from "react";
import * as tmPose from "@teachablemachine/pose";

const TeachablePose = () => {
  const URL = "https://teachablemachine.withgoogle.com/models/nzdPIHSfH/"; // Thay đúng model URL
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState("Đang tải mô hình...");

  useEffect(() => {
    let model, webcam, ctx, animationFrame;

    const init = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmPose.load(modelURL, metadataURL);
      webcam = new tmPose.Webcam(400, 400, true); // width, height, flip
      await webcam.setup();
      await webcam.play();

      webcamRef.current.appendChild(webcam.canvas);

      ctx = canvasRef.current.getContext("2d");

      const loop = async () => {
        webcam.update();
        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const predictions = await model.predict(posenetOutput);

        const top = predictions.reduce((a, b) => a.probability > b.probability ? a : b);
        setPrediction(`${top.className} (${(top.probability * 100).toFixed(2)}%)`);

        // 🎯 Vẽ lại hình ảnh webcam vào canvas
        ctx.drawImage(webcam.canvas, 0, 0, 400, 400);

        // 🎯 Vẽ keypoints và skeleton
        if (pose) {
          tmPose.drawKeypoints(pose.keypoints, 0.5, ctx);
          tmPose.drawSkeleton(pose.keypoints, 0.5, ctx);
        }

        animationFrame = requestAnimationFrame(loop);
      };

      loop();
    };

    init();

    return () => {
      if (webcam) webcam.stop();
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  

  return (
    <div>
      <h2>Teachable Machine Pose</h2>
      <div ref={webcamRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width="400" height="400" />
      <p>Kết quả: {prediction}</p>
    </div>
  );
};

export default TeachablePose;
