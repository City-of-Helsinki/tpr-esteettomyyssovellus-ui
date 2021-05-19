// place for custom typescript interfaces/"models"

import { Dictionary } from "@reduxjs/toolkit";

export interface User {
  authenticated: boolean;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface GeneralState {
  user?: User;
}

export interface QuestionContainerProps {
  questionNumber: number;
  questionText: string;
  questionInfo?: string | undefined;
  children: JSX.Element;
  hasAdditionalInfo: boolean;
  backgroundColor: string;
}

export interface HeadlineQuestionContainerProps {
  headline: string;
}

export interface DropdownQuestionProps {
  options: Dictionary<string>[];
  label?: string;
  placeholder?: string;
}

export interface QuestionInfoProps {
  openText: string;
  openIcon: JSX.Element;
  closeText: string;
  closeIcon: JSX.Element;
  textOnBottom?: boolean;
  questionInfo: string;
  showInfoText: boolean;
  clickHandler: () => void;
}

export interface QuestionDataProps {
  type: string;
  qnumber: number;
  qText: string;
  qInfo?: string | undefined;
  hasAdditionalInformation: boolean;
  data: Dictionary<string>[];
}

export interface QuestionTextInputProps {
  id: string;
  label?: string;
  placeholder: string;
  helperText?: string;
  required?: boolean;
}
export interface QuestionButtonProps {
  children: string;
  variant: "primary" | "secondary" | "success" | "danger";
  iconLeft?: JSX.Element | undefined;
  iconRight?: JSX.Element | undefined;
  disabled?: boolean;
  onClickHandler?: () => void;
}

export interface QuestionFormCtrlButtonsProps {
  hasCancelButton?: boolean;
  hasValidateButton?: boolean;
  hasSaveDraftButton?: boolean;
  hasPreviewButton?: boolean;
}
