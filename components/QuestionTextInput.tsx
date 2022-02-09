import React, { ChangeEvent } from "react";
import { TextInput } from "hds-react";
import { QuestionTextInputProps } from "../types/general";
// import { useAppDispatch, useAppSelector } from "../state/hooks";
// import { setAnswer } from "../state/reducers/formSlice";
import style from "./QuestionTextInput.module.scss";

// usage: general custom textinput from HDS
const QuestionTextInput = ({ id, placeholder, value }: QuestionTextInputProps): JSX.Element => {
  // const dispatch = useAppDispatch();
  // const curAnswers = useAppSelector((state) => state.formReducer.answers);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    // TODO
    // const answer = e.target.value;
    // dispatch(setAnswer({ questionNumber, answer }));
  };

  return <TextInput className={style.textInput} id={id} value={value} placeholder={placeholder} onChange={handleTextChange} />;
};

export default QuestionTextInput;
