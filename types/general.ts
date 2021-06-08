// place for custom typescript interfaces/"models"

import { Dictionary } from "@reduxjs/toolkit";
import { LatLngExpression } from "leaflet";
import { string } from "yup";

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
  initOpen?: boolean;
  children: any;
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
  children: string | JSX.Element;
}

export interface QuestionDataProps {
  type: string;
  qnumber: number;
  qText: string;
  qInfo?: string | undefined;
  data: Dictionary<string>[];
}

export interface QuestionTextInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  stateGetter?: string;
  stateSetter?: any;
}
export interface QuestionButtonProps {
  children: string;
  variant: "primary" | "secondary" | "success" | "danger";
  iconLeft?: JSX.Element | undefined;
  iconRight?: JSX.Element | undefined;
  disabled?: boolean;
  onClickHandler?: () => void;
}

export interface QuestionRadioButtonsProps {
  mainLabel?: string;
  firstButtonLabel?: string;
  secondButtonLabel?: string;
}

export interface QuestionFormCtrlButtonsProps {
  hasCancelButton?: boolean;
  hasValidateButton?: boolean;
  hasSaveDraftButton?: boolean;
  hasPreviewButton?: boolean;
}

export interface QuestionsListProps {
  additionalInfoVisible: boolean;
}

export interface QuestionAdditionalInfoCtrlButtonProps {
  onClick: () => void;
  curState: boolean;
}

export interface ServicepointLandingSummaryProps {
  header: string;
  // TODO: change any type when knowledge of the type getting
  data?: any;
}

export interface ServicepointLandingSummaryContentProps {
  contentHeader?: string;
  // TODO: change any type when knowledge of the type getting
  children?: any;
}

export interface ServicepointLandingSummaryCtrlButtonsProps {
  hasData: boolean;
}

export interface MapProps {
  initCenter: [number, number];
  initZoom: number;
  initLocation: [number, number];
  draggableMarker?: boolean;
  updateLocationHandler?: (location: LatLngExpression) => void;
}

// general for qnumber
export interface AdditionalContentProps {
  questionNumber: string;
}

export interface Location {
  description?: string;
  coordinates?: [number, number] | null;
}

export interface AdditionalInfos {
  locations?: Location[];
  comments?:  Languages[];
  pictures?:  PictureProps[];
}

export interface PictureProps {
  qNumber: string;
  id: string;
  base64? : string;
  url?: string;
  name?: string;
  altTextLocales: Languages
}

export interface AdditionalInfoProps {
  [questionNumbers: string]: AdditionalInfos;
}

// Common interfaces

export interface Languages {
    fi: string;
    en?: string;
    sv?: string;
}