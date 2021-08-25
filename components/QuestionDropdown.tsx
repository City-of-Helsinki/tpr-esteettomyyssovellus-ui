import React from "react";
import { Select } from "hds-react";
import { DropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector } from "../state/hooks";
import {
  setAnsweredChoice,
  setAnswer,
  removeAnsweredChoice,
} from "../state/reducers/formSlice";
import { useAppDispatch } from "../state/hooks";
import { Dictionary } from "@reduxjs/toolkit";
import { useI18n } from "next-localization";

// usage: general custom dropdown component form HDS
// notes: this component uses HDS Select, HDS says:
// if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
// this project doesn't yet have Combobox, maybe not needed also
const QuestionDropdown = ({
  options,
  placeholder = "--Valitse--",
  label = "",
  questionNumber,
  blockId,
}: DropdownQuestionProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // handle add/remove answer from state
  const handleChange = (selected: Dictionary<string>) => {
    const answerString = selected["value"];
    const questionNumString = questionNumber;
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
  const invalidBlocks = currentValues.invalidBlocks;

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
    value: value.toString(),
  };

  const isInvalid = value == "" && invalidBlocks.includes(blockId!);

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
      error={i18n.t("common.missingAnswerValue")}
      invalid={isInvalid}
    />
  );
};

export default QuestionDropdown;
