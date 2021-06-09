import React from "react";
import { TextInput } from "hds-react";
import { QuestionTextInputProps } from "../types/general";

const QuestionTextInput = ({ id="0", label, placeholder, helperText, required = false, disabled = false }: QuestionTextInputProps): JSX.Element => {
  return <TextInput id={id} label={label} placeholder={placeholder} helperText={helperText} required={required} disabled={disabled}/>;
};

export default QuestionTextInput;
