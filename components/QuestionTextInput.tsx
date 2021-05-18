import React from "react";
import { TextInput } from "hds-react";
import { QuestionTextInputProps } from "../types/general";

const QuestionTextInput = ({ id, label, placeholder, helperText, required = false }: QuestionTextInputProps): JSX.Element => {
  return <TextInput id={id} label={label} placeholder={placeholder} helperText={helperText} required={required} />;
};

export default QuestionTextInput;
