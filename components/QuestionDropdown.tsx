import React from "react";
import { Select } from "hds-react";
import { DropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector } from "../state/hooks";
import {
  setAnsweredChoice,
  setAnswer,
  removeAnsweredChoice
} from "../state/reducers/formSlice";
import formSlice from "../state/reducers/formSlice";
import { useAppDispatch } from "../state/hooks";
import { Dictionary } from "@reduxjs/toolkit";
import { useI18n } from "next-localization";

// used for Dropdown components
// this component uses HDS Select, if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
const QuestionDropdown = ({
  options,
  placeholder = "--Valitse--",
  label = "",
  questionNumber
}: DropdownQuestionProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const i18n = useI18n();

  const handleChange = (selected: Dictionary<string>) => {
    const answerString = selected["value"];
    const questionNumString = questionNumber;
    console.log(selected);
    if (answerString != undefined && questionNumber != undefined) {
      options.map((element: Dictionary<string>) => {
        element["value"] != undefined
          ? dispatch(removeAnsweredChoice(element["value"]))
          : null;
      });
      const answer = Number(answerString);
      const questionNumber = Number(questionNumString);
      dispatch(setAnswer({ questionNumber, answer }));
      dispatch(setAnsweredChoice(answerString));
    }
  };

  const currentValues = useAppSelector((state) => state.formReducer);
  const value =
    questionNumber != undefined &&
    currentValues.answers[questionNumber] != undefined
      ? currentValues.answers[questionNumber]
      : "";
  let currentLabel = options.find((element) => {
    return element["value"] === value;
  });

  const currentValue: Dictionary<string> = {
    label: currentLabel != undefined ? currentLabel["label"] : "",
    value: value.toString()
  };

  return (
    <Select
      className={style.selectDropdown}
      label={label}
      placeholder={
        placeholder == "--Valitse--"
          ? i18n.t("accessibilityForm.choose")
          : placeholder
      }
      options={options}
      onChange={handleChange}
      value={currentValue}
    />
  );
};

export default QuestionDropdown;
