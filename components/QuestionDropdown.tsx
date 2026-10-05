import React from "react";
import { Select } from "hds-react";
import type { Option, OptionInProps } from "hds-react";
import { useI18n } from "next-localization";
import { QuestionDropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setAnswer } from "../state/reducers/formSlice";

// usage: general custom dropdown component form HDS
// notes: this component uses HDS Select, HDS says:
// if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
// this project doesn't yet have Combobox, maybe not needed also
function QuestionDropdown({ options, placeholder = "--Valitse--", questionId, blockId }: QuestionDropdownQuestionProps): JSX.Element {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // handle add/remove answer from state
  const handleChange = (selected: Option) => {
    const answer = Number(selected.value);
    if (!Number.isNaN(answer) && questionId !== undefined && options) {
      /*
      options.forEach((element) => {
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
  const selectOptions: OptionInProps[] | undefined = options?.map((option) => ({
    value: String(option.value),
    label: option.label ?? "",
  }));
  const currentValue = value !== -1 ? String(value) : undefined;

  const isInvalid = value === -1 && blockId !== undefined && curInvalidBlocks.includes(blockId);

  return selectOptions ? (
    <Select
      aria-labelledby={`question_${questionId}`}
      className={style.selectDropdown}
      texts={{
        // label={label} // hidden label used by screen readers only - not needed anymore with HDS 2.5.0
        placeholder: placeholder === "--Valitse--" ? i18n.t("accessibilityForm.choose") : placeholder,
        error: i18n.t("common.missingAnswerValue"),
      }}
      options={selectOptions}
      onChange={(_selectedOptions, clickedOption) => handleChange(clickedOption)}
      value={currentValue}
      invalid={isInvalid}
    />
  ) : (
    <></>
  );
}

export default QuestionDropdown;
