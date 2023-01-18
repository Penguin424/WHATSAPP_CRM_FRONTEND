import React from "react";

interface IPropsAudio {
  audioBase64: string;
}

const AudioComponent = ({ audioBase64 }: IPropsAudio) => {
  return (
    <div>
      <audio controls>
        <source
          src={`data:audio/mpeg;base64,${audioBase64}`}
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
};

export default AudioComponent;
