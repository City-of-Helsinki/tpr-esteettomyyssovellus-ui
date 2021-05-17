import React from "react";
import { Select } from "hds-react";
import { DropdownQuestionProps } from "../types/general";
import style from "./QuestionDropdown.module.scss";

// used for Dropdown components
// this component uses HDS Select, if 1) more than 8 options 2) needs filtering by typing create&use HDS Combobox
const QuestionDropdown = ({ options }: DropdownQuestionProps): JSX.Element => {
  return (
    <Select className={style.selectDropdown} label="" placeholder="PH: Valitse" options={options} />
  );
};

export default QuestionDropdown;
