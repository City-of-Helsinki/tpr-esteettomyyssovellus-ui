import React from "react";
import { Select } from "hds-react";
import { useI18n } from "next-localization";
import { InputOption, QuestionDropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setAnswer } from "../state/reducers/formSlice";

// usage: general custom dropdown component form HDS
// notes: this component uses HDS Select, HDS says:
// if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
// this project doesn't yet have Combobox, maybe not needed also
const QuestionDropdown = ({ options, placeholder = "--Valitse--", label = "", questionId, blockId }: QuestionDropdownQuestionProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // handle add/remove answer from state
  const handleChange = (selected: InputOption) => {
    const answer = selected.value;
    if (answer !== undefined && questionId !== undefined && options) {
      /*
      options.forEach((element: InputOption) => {
        if (element.value !== undefined) {
          dispatch(removeAnsweredChoice(element.value));
        }
      });
      */
      dispatch(setAnswer({ questionId, answer }));
      // dispatch(setAnsweredChoice(answer));
    }
  };

  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  const value = questionId !== undefined && curAnswers[questionId] !== undefined ? curAnswers[questionId] : -1;
  const currentLabel = options?.find((element) => {
    return element.value === value;
  });

  const currentValue: InputOption = {
    label: currentLabel !== undefined ? currentLabel.label : "",
    value,
  };

  const isInvalid = value === -1 && blockId !== undefined && curInvalidBlocks.includes(blockId);

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
