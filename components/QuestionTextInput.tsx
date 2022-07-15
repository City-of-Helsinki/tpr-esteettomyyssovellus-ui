import React, { ChangeEvent } from "react";
import { TextInput } from "hds-react";
import { useI18n } from "next-localization";
import { QuestionTextInputProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setExtraAnswer } from "../state/reducers/formSlice";
import style from "./QuestionTextInput.module.scss";

// usage: general custom textinput from HDS
const QuestionTextInput = ({ id, questionBlockFieldId, placeholder, isTextInvalid, ariaLabelledBy }: QuestionTextInputProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const value = curExtraAnswers[questionBlockFieldId] ?? "";

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    dispatch(setExtraAnswer({ questionBlockFieldId, answer }));
  };

  return (
    <TextInput
      className={style.textInput}
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={handleTextChange}
      invalid={isTextInvalid}
      errorText={isTextInvalid ? i18n.t("common.missingTextValue") : ""}
      aria-labelledby={ariaLabelledBy}
    />
  );
};

export default QuestionTextInput;
