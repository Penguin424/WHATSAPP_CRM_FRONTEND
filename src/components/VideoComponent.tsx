import React from "react";

interface IPropsVideoComponent {
  videoBase64: string;
}

const VideoComponent = ({ videoBase64 }: IPropsVideoComponent) => {
  return (
    <div>
      <video
        style={{
          width: "100%",
          height: "100%",
        }}
        controls
      >
        <source src={`data:video/mp4;base64,${videoBase64}`} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoComponent;
