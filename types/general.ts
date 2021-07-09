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
  canAddLocation?: boolean;
  canAddPhotoMaxCount?: number;
  canAddComment?: boolean;
}

export interface HeadlineQuestionContainerProps {
  text?: string;
  initOpen?: boolean;
  children?: any;
  number?: number;
}

export interface DropdownQuestionProps {
  options: Dictionary<string>[];
  label?: string;
  placeholder?: string;
  questionNumber?: number;
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

export interface QuestionButtonProps {
  children: string;
  variant: "primary" | "secondary" | "success" | "danger";
  iconLeft?: JSX.Element | undefined;
  iconRight?: JSX.Element | undefined;
  disabled?: boolean;
  onClickHandler?: (param?: any) => void;
  onChange?: (param?: any) => void;
}

export interface QuestionRadioButtonsProps {
  mainLabel?: string;
  firstButtonLabel?: string;
  secondButtonLabel?: string;
  options?: Dictionary<string>[];
  value?: number;
}

export interface QuestionFormCtrlButtonsProps {
  hasCancelButton?: boolean;
  hasValidateButton?: boolean;
  hasSaveDraftButton?: boolean;
  hasPreviewButton?: boolean;
}

// todo: add type for questionlist
export interface QuestionsListProps {
  additionalInfoVisible: boolean;
  questions?: QuestionProps[] | null;
  answers?: QuestionChoicesProps[] | null;
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
  onlyLink?: boolean;
  questionNumber: string;
  compId: number;
  onDelete?: (id?: number, type?: string) => void;
}

export interface Location {
  description?: string;
  coordinates?: [number, number] | null;
}

export interface AdditionalInfos {
  locations?: Location[];
  comments?: Languages;
  pictures?: PictureProps[];
  components?: AdditionalComponentProps[];
}

export interface AdditionalComponentProps {
  id: number;
  type: string;
}

export interface PictureProps {
  qNumber: string;
  id: number;
  base?: string;
  url?: string;
  name?: string;
  source: string;
  alt_fi: string;
  alt_en?: string;
  alt_sv?: string;
}

export interface AdditionalInfoProps {
  [key: string]: AdditionalInfos;
}

// Common interfaces

export interface Languages {
  fi?: string;
  en?: string;
  sv?: string;
}

// FORMS related stuff

export interface MainEntranceFormProps {
  isMobile?: boolean;
  QuestionsData?: QuestionProps[];
  QuestionChoicesData?: QuestionChoicesProps[];
  QuestionBlocksData?: QuestionBlockProps[];
  ServicePointData?: any;
}

// todo: added ? optional questionmark to all, remove where mandatory
export interface QuestionProps {
  can_add_comment?: string;
  can_add_location?: string;
  can_add_photo_max_count?: number;
  description?: string;
  form_id?: number;
  language_id: number;
  photo_text?: string;
  photo_url?: string;
  question_block_id?: number;
  question_code?: string;
  question_id?: number;
  question_level?: number;
  question_order_text?: string;
  technical_id?: string;
  text?: string;
  visible_if_question_choice?: string;
  yes_no_question?: string;
}

export interface QuestionBlockProps {
  questions?: QuestionProps[] | null;
  answers?: QuestionChoicesProps[] | null;
  description?: string | null;
  form_id?: number;
  language_id?: number;
  photo_text?: string | null;
  photo_url?: string | null;
  question_block_code?: string;
  question_block_id?: number;
  question_block_order_text?: string;
  technical_id?: string;
  text?: string;
  visible_if_question_choice?: string | null;
  photoUrl?: string | null;
  photoText?: string | null;
}

export interface QuestionChoicesProps {
  choice_order_text?: string;
  form_id?: number;
  language_id?: number;
  question_block_id?: number;
  question_choice_id?: number;
  question_id?: number;
  technical_id?: string;
  text?: string;
}

export interface QuestionBlocksProps {
  description?: string;
  form_id: number;
  language_id: number;
  photo_text?: string;
  photo_url?: string;
  question_block_code: string;
  question_block_id: number;
  question_block_order_text: string;
  technical_id: string;
  text: string;
  visible_if_question_choice: string;
}

//TODO: add type for questionlist and question
export interface QuestionBlockProps {
  mainInfoText?: string;
  // questionList: any;
}

export interface PathTreeProps {
  treeItems: any[];
}

export interface QuestionAdditionalInfoProps {
  canAddLocation?: boolean;
  canAddPhotoMaxCount?: number;
  canAddComment?: boolean;
}
