import "./App.css";
import React, { useState, useEffect, useRef } from "react";

const App = () => {

  //setting states to update variables
  const [input, setInput] = useState("");
  const [wpm, setWPM] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [text, setText] = useState("");
  const [correctness, setCorrectness] = useState([]);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [totalKeyPresses, setTotalKeyPresses] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [textCompleted, setTextCompleted] = useState(false);
  const inputRef = useRef(null);


  //function to generate new text 
  const generateRandomText = () => {
    const keys = "asdfjkl;";
    let generatedText = "";
    const textLength = 15;

    for (let i = 0; i < textLength; i++) {
      const randomIndex = Math.floor(Math.random() * keys.length);
      generatedText += keys[randomIndex];
    }

    setText(generatedText);
    setCorrectness(Array(generatedText.length).fill(null));

    setWPM(0);
    setAccuracy(0);

    setInput("");
    setBackspaceCount(0);
    setPracticeStarted(false);
    setTotalKeyPresses(0);
    setStartTime(0);
    setTextCompleted(false);
    inputRef.current.focus();
  };

  
  useEffect(() => {
    generateRandomText();
  }, []);


  useEffect(() => {
    if (practiceStarted && !textCompleted) {
      setStartTime(Date.now());
    }
  }, [practiceStarted, textCompleted]);

  useEffect(() => {
    if (practiceStarted && !textCompleted) {
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        setElapsedTime(currentTime - startTime);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [elapsedTime, practiceStarted, startTime, textCompleted]);



  //handling the user input
  function handleInput(event) {
    const value = event.target.value;
    if (!practiceStarted && value.length === 1) {
      // Start the timer when the user starts typing
      setPracticeStarted(true);
      setInput(value);
      setStartTime(Date.now());
      return;
    }

    setInput(value);

    // checking correctness whether user type correct character or incorrect
    const newCorrectness = text.split("").map((char, index) => {
      if (index < value.length) {
        return value[index] === char;
      } else {
        return null; // Mark remaining characters as null
      }
    });

    setCorrectness(newCorrectness);

//checking if user completed the text
    if (value.length === text.length) {
      const wordsTyped = value.trim().split(/\s+/).length;
      const timeInMinutes = elapsedTime / 60000;

      const MIN_WPM_THRESHOLD = 1;
      const currentWPM = Math.max(
        Math.round(wordsTyped / timeInMinutes),
        MIN_WPM_THRESHOLD
      );

      const correctCount = newCorrectness.filter(
        (correct) => correct !== null && correct
      ).length;

      let adjustedAccuracy = 0;
      if (totalKeyPresses === text.length) {
        // Exclude backspace count if the user typed the whole text correctly
        adjustedAccuracy = (correctCount / totalKeyPresses) * 100;
      } else {
        adjustedAccuracy =
          (correctCount / (totalKeyPresses + backspaceCount)) * 100;
      }

      setAccuracy(adjustedAccuracy.toFixed(2));

      setWPM(currentWPM);
      setTextCompleted(true);
      setInput("");
    }
  }

  //tracking count of backspaces
  function handleKeyDown(event) {
    if (event.key === "Backspace") {
      setBackspaceCount((prevCount) => prevCount + 1);
    }

    setTotalKeyPresses((prevKeyPresses) => prevKeyPresses + 1);
  }

  // resting all the values and generating new text
  function handleNewText() {
    generateRandomText();
    setWPM(0);
    setAccuracy(0);
    setElapsedTime(0);
  }

  return (
    <div className="Container">

  
      <h1>React Js Touch Typing Tool</h1>
      {practiceStarted && !textCompleted && (
        <h2>Time: {elapsedTime / 1000} seconds</h2>
      )}


      {textCompleted && <h2>Time Taken: {elapsedTime / 1000} seconds</h2>}


      <div className="GenInputContainer">
        <h1>{text}</h1>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={input}
        placeholder="Type above text here"
        className={`typingInput ${
          input === "typingInput"
            ? ""
            : input
                .split("")
                .map((_, index) =>
                  correctness[index] === null
                    ? ""
                    : correctness[index]
                    ? "typingInput"
                    : "incorrect"
                )
                .join(" ")
        }`}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />

      <button onClick={handleNewText} className="Textbtn">
        Generate New Text
      </button>

      <div className="stats">
        <h1>WPM: {wpm}</h1>
        <h1>Accuracy: {accuracy}%</h1>

        <h1>Total Key Presses: {totalKeyPresses}</h1>
      </div>
    </div>
  );
};

export default App;
