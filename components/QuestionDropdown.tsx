import React from "react";
import { Select } from "hds-react";
import { DropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector } from "../state/hooks";
import { setAnsweredChoice, setAnswer, removeAnsweredChoice } from "../state/reducers/formSlice";
import formSlice from "../state/reducers/formSlice";
import { useAppDispatch } from "../state/hooks";
import { Dictionary } from "@reduxjs/toolkit";

// used for Dropdown components
// this component uses HDS Select, if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
const QuestionDropdown = ({ options, placeholder = "--Valitse--", label="", questionNumber}: DropdownQuestionProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const handleChange = (selected: Dictionary<string>) => {
    const answerString = selected["value"];
    const questionNumString = questionNumber;

    if (answerString != undefined && questionNumber != undefined) {
      options.map((element: any) => {
        dispatch(removeAnsweredChoice(element["value"]));
      })
      const answer = Number(answerString);
      const questionNumber = Number(questionNumString);
      dispatch(setAnswer({questionNumber, answer}));
      dispatch(setAnsweredChoice(answerString));
    }
  };
  
  const currentValues = useAppSelector((state) => state.formReducer);
  const questionNumString = questionNumber != undefined ? questionNumber.toString() : "";

  const x = questionNumber != undefined && currentValues.answers[questionNumber] != undefined ?  currentValues.answers[questionNumber] : "";
  let currentLabel = options.find((element) => {return element["value"] === x});

  const currentValue: Dictionary<string> = {"label": currentLabel != undefined ? currentLabel["label"] : "", "value": x.toString()};

  return <Select className={style.selectDropdown} 
                 label={label} 
                 placeholder={placeholder} 
                 options={options} 
                 onChange={handleChange}
                 value={currentValue} />;

};

export default QuestionDropdown;
