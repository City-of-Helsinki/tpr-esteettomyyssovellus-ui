import React from "react";
import { Select } from "hds-react";
import { useI18n } from "next-localization";
import { DropdownQuestionProps, InputOption } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setAnsweredChoice, setAnswer, removeAnsweredChoice } from "../state/reducers/formSlice";

// usage: general custom dropdown component form HDS
// notes: this component uses HDS Select, HDS says:
// if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
// this project doesn't yet have Combobox, maybe not needed also
const QuestionDropdown = ({ options, placeholder = "--Valitse--", label = "", questionNumber, blockId }: DropdownQuestionProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // handle add/remove answer from state
  const handleChange = (selected: InputOption) => {
    const answer = selected.value;
    if (answer !== undefined && questionNumber !== undefined && options) {
      options.forEach((element: InputOption) => {
        if (element.value !== undefined) {
          dispatch(removeAnsweredChoice(element.value));
        }
      });
      dispatch(setAnswer({ questionNumber, answer }));
      dispatch(setAnsweredChoice(answer));
    }
  };

  const currentValues = useAppSelector((state) => state.formReducer);
  const { answers, invalidBlocks } = currentValues;

  const value = questionNumber !== undefined && answers[questionNumber] !== undefined ? answers[questionNumber] : -1;
  const currentLabel = options?.find((element) => {
    return element.value === value;
  });

  const currentValue: InputOption = {
    label: currentLabel !== undefined ? currentLabel.label : "",
    value,
  };

  const isInvalid = value === -1 && !!blockId && invalidBlocks.includes(blockId);

  return options ? (
    <Select
      className={style.selectDropdown}
      label={label}
      placeholder={placeholder === "--Valitse--" ? i18n.t("accessibilityForm.choose") : placeholder}
      options={options}
      onChange={handleChange}
      value={currentValue}
      error={i18n.t("common.missingAnswerValue")}
      invalid={isInvalid}
    />
  ) : (
    <></>
  );
};

export default QuestionDropdown;
