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
}

export interface QuestionInfoProps {
  openText: string;
  openIcon: JSX.Element;
  closeText: string;
  closeIcon: JSX.Element;
  textOnBottom?: boolean;
  questionInfo: string;
  showInfoText: boolean;
  clickHandler: any;
}

export interface QuestionDataProps {
  type: string;
  qnumber: number;
  qText: string;
  qInfo?: string | undefined;
  hasAdditionalInformation: boolean;
  data: Dictionary<string>[];
}
