// place for custom typescript interfaces/"models"

import { Dictionary } from "@reduxjs/toolkit";
import { LatLngExpression } from "leaflet";
import {
  BackendEntranceAnswer,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionChoice,
  EntranceResults,
  QuestionAnswerComment,
  QuestionAnswerLocation,
  QuestionAnswerPhoto,
  QuestionAnswerPhotoTxt,
  Servicepoint,
  StoredSentence,
} from "./backendModels";

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
  questionId?: number;
  questionBlockId: number;
  questionNumber: number | string;
  questionText: string;
  questionInfo?: string | null;
  children: JSX.Element;
  hasAdditionalInfo: boolean;
  backgroundColor: string;
  canAddLocation?: boolean;
  canAddPhotoMaxCount?: number;
  canAddComment?: boolean;
  photoUrl?: string | null;
  photoText?: string | null;
  isMainLocPicComponent?: boolean;
}

export interface HeadlineQuestionContainerProps {
  text?: string;
  initOpen?: boolean;
  children?: JSX.Element;
  number?: number;
  isValid?: boolean;
  id?: string;
}

export interface DropdownQuestionProps {
  options: Dictionary<string>[];
  label?: string;
  placeholder?: string;
  questionNumber?: number;
  blockId?: number;
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
  onClickHandler?: () => void;
  onChange?: () => void;
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
  visibleBlocks?: (JSX.Element | null)[] | null;
  visibleQuestionChoices?: BackendQuestionChoice[] | undefined;
}

// todo: add type for questionlist
export interface QuestionsListProps {
  additionalInfoVisible: boolean;
  questions?: BackendQuestion[] | null;
  answers?: BackendQuestionChoice[] | null;
}

export interface QuestionAdditionalInfoCtrlButtonProps {
  onClick: () => void;
  curState: boolean;
}

export interface ServicepointLandingSummaryProps {
  header: string;
  data: Servicepoint | AccessibilityData;
}

export interface PreviewPageLandingSummaryProps {
  data: AccessibilityData;
}

export interface ServicepointLandingSummaryContentProps {
  contentHeader?: string;
  // TODO: change any type when knowledge of the type getting
  children?: any;
}

export interface ServicepointLandingSummaryCtrlButtonsProps {
  hasData: boolean;
}

export interface PreviewControlButtonsProps {
  hasHeader: boolean;
}

export interface MapProps {
  questionId: number;
  initCenter?: [number, number] | number[];
  initZoom: number;
  initLocation: [number, number] | number[];
  draggableMarker?: boolean;
  updateLocationHandler?: (location: LatLngExpression) => void;
  makeStatic?: boolean;
  isPreview?: boolean;
  isMainLocPicComponent?: boolean;
}

// general for qnumber
export interface AdditionalContentProps {
  onlyLink?: boolean;
  questionId: number;
  compId: number;
  onDelete?: (id?: number, type?: string) => void;
  canDelete?: boolean;
  initValue?: any;
  isMainLocPicComponent?: boolean;
}

export interface MainPictureContentProps {
  onlyLink?: boolean;
  pageId: number;
  onDelete?: (id?: number, type?: string) => void;
  initValue?: any;
}

export interface Location {
  coordinates?: [number, number];
  locNorthing?: number;
  locEasting?: number;
  usedZoom?: number;
}

// notice/todo: names locationS and commentS can atm have only one location and commend -> maybe rename
export interface AdditionalInfos {
  properlySaved?: boolean;
  locations?: Location;
  comments?: Languages;
  pictures?: PictureProps[];
  components?: AdditionalComponentProps[];
  invalidValues?: addinfoInvalidAnswers[];
}

// invalid values 1 per component
// interface addinfoInvalidValues {
//   id: number;
//   invalidValues?: addinfoInvalidAnswers;
// }

// invalid answers list of
interface addinfoInvalidAnswers {
  id: number;
  invalidAnswers?: string[];
}

export interface AdditionalComponentProps {
  id: number;
  type: string;
}

export interface PictureProps {
  qNumber: number;
  id: number;
  base?: string;
  uuid?: string;
  url?: string;
  name?: string;
  source?: string;
  fi: string;
  en?: string;
  sv?: string;
}

export interface MainPictureProps {
  base?: string;
  uuid?: string;
  url?: string;
  name?: string;
  source?: string;
  fi: string;
  en?: string;
  sv?: string;
}

export interface AdditionalInfoProps {
  [key: string]: AdditionalInfos;
}

export interface AdditionalInfoStateProps {
  initAddInfoFromDb: boolean;
  curEditingInitialState: AdditionalInfoProps;
  additionalInfo: AdditionalInfoProps;
}

export interface MainLocationOrImageProps {
  pageId: number;
  caseId: number;
}

// Common interfaces

export interface Languages {
  fi: string;
  en: string;
  sv: string;
  [key: string]: string;
}

// FORMS related stuff

export interface MainEntranceFormProps {
  isMobile?: boolean;
  questionsData: BackendQuestion[];
  questionChoicesData: BackendQuestionChoice[];
  questionBlocksData: BackendQuestionBlock[];
  servicepointData: Servicepoint;
  questionAnswerData: BackendEntranceAnswer[];
  additionalInfosData: FetchAdditionalInfos;
  form_id: number;
  entrance_id: string;
}

interface FetchAdditionalInfos {
  comments?: QuestionAnswerComment[];
  locations?: QuestionAnswerLocation[];
  photos?: QuestionAnswerPhoto[];
  phototexts?: QuestionAnswerPhotoTxt[];
}

// todo: added ? optional questionmark to all, remove where mandatory
/*
export interface QuestionProps {
  can_add_comment?: string;
  can_add_location?: string;
  can_add_photo_max_count?: number;
  description?: string;
  form_id: number;
  language_id: number;
  photo_text?: string | null;
  photo_url?: string | null;
  question_block_id: number;
  question_code: string;
  question_id: number;
  question_level: number;
  question_order_text: string;
  technical_id: string;
  text: string;
  visible_if_question_choice: string;
  yes_no_question: string;
}
*/

export interface QuestionBlockProps {
  questions?: BackendQuestion[] | null;
  answers?: BackendQuestionChoice[] | null;
  description?: string | null;
  photoUrl?: string | null;
  photoText?: string | null;
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

// TODO: add type for questionlist and question
/*
export interface QuestionBlockProps {
  mainInfoText?: string;
  // questionList: any;
}
*/

export interface PathTreeProps {
  treeItems: any[];
}

export interface QuestionAdditionalInfoProps {
  questionId: number;
  blockId?: number;
  canAddLocation?: boolean;
  canAddPhotoMaxCount?: number;
  canAddComment?: boolean;
  isMainLocPicComponent?: boolean;
}

export interface ContactInformationProps {
  blockNumber?: number;
}

export interface AdditionalInfoPageProps {
  questionId: number;
  questionData?: BackendQuestion[];
}

export interface AdditionalInfoCtrlButtonsProps {
  questionId: number;
}

export interface ChangeProps {
  changed?: string;
  servicepointId?: number;
  servicepointName?: string;
  newAddress?: string;
  oldAddress?: string;
  newAddressNumber?: string;
  oldAddressNumber?: string;
  newAddressCity?: string;
  oldAddressCity?: string;
  user?: string;
}

export interface NoticeProps {
  icon: JSX.Element;
  title: string;
  text: string;
  button?: JSX.Element;
}

export interface mainLocationAndPictureProps {
  canAddLocation: boolean;
  canAddPicture: boolean;
}

export interface AccessibilityData {
  [key: string]: StoredSentence[];
}

export interface DetailsProps {
  servicepointData: Servicepoint;
  accessibilityData: AccessibilityData;
  entranceData: EntranceResults;
  hasExistingFormData: boolean;
  isFinished: boolean;
}

export interface PreviewProps {
  servicepointData: Servicepoint;
  accessibilityData: AccessibilityData;
  entranceData: EntranceResults;
}

export interface ElementCountProps {
  comment: number;
  upload: number;
  link: number;
  location: number;
  [key: string]: number;
}
