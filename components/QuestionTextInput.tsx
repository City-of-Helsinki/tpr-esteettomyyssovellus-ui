import React, { ChangeEvent } from "react";
import { TextInput } from "hds-react";
import { QuestionTextInputProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setExtraAnswer } from "../state/reducers/formSlice";
import style from "./QuestionTextInput.module.scss";

// usage: general custom textinput from HDS
const QuestionTextInput = ({ id, questionBlockFieldId, placeholder }: QuestionTextInputProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const value = curExtraAnswers[questionBlockFieldId] ?? "";

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value;
    dispatch(setExtraAnswer({ questionBlockFieldId, answer }));
  };

  return <TextInput className={style.textInput} id={id} value={value} placeholder={placeholder} onChange={handleTextChange} />;
};

export default QuestionTextInput;
