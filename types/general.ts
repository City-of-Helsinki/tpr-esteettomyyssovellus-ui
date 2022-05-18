// place for custom typescript interfaces/"models"

import { Dispatch, SetStateAction } from "react";
// import { LatLngExpression } from "leaflet";
import {
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceChoice,
  BackendEntranceField,
  BackendEntrancePlace,
  BackendEntranceSentence,
  BackendPlace,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionBlockField,
  BackendQuestionChoice,
  BackendServicepoint,
  // QuestionAnswerComment,
  // QuestionAnswerLocation,
  // QuestionAnswerPhoto,
  // QuestionAnswerPhotoTxt,
} from "./backendModels";

export interface KeyValueNumber {
  [key: number]: number;
}

export interface KeyValueString {
  [key: number]: string;
}

export interface QuestionContainerProps {
  question: BackendQuestion;
  accessibilityPlaces: BackendPlace[];
  children: JSX.Element;
  // hasAdditionalInfo: boolean;
  // canAddLocation?: boolean;
  // canAddPhotoMaxCount?: number;
  // canAddComment?: boolean;
  // isMainLocPicComponent?: boolean;
}

export interface QuestionExtraFieldProps {
  fieldNumber?: number;
  questionText?: string;
  questionInfo?: string;
  isMandatory: boolean;
  isTextInvalid: boolean;
  children: JSX.Element;
}

export interface HeadlineQuestionContainerProps {
  text?: string;
  initOpen?: boolean;
  children?: JSX.Element;
  number?: number;
  isValid?: boolean;
  id?: string;
}

export interface InputOption {
  value: number;
  label?: string;
}

export interface QuestionDropdownQuestionProps {
  options?: InputOption[];
  label?: string;
  placeholder?: string;
  questionId?: number;
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
  options?: InputOption[];
  questionId?: number;
  blockId?: number;
}

export interface QuestionTextInputProps {
  id: string;
  questionBlockFieldId: number;
  placeholder?: string;
  isTextInvalid: boolean;
}

export interface QuestionFormCtrlButtonsProps {
  hasCancelButton?: boolean;
  hasValidateButton?: boolean;
  hasSaveDraftButton?: boolean;
  hasPreviewButton?: boolean;
  hasContinueButton?: boolean;
  visibleBlocks?: (JSX.Element | null)[] | null;
  questionsData: BackendQuestion[];
  questionChoicesData: BackendQuestionChoice[];
  formId: number;
}

export interface QuestionsListProps {
  // additionalInfoVisible: boolean;
  questions?: BackendQuestion[];
  answerChoices?: BackendQuestionChoice[];
  accessibilityPlaces: BackendPlace[];
}

export interface QuestionBlockExtraFieldListProps {
  extraFields?: BackendQuestionBlockField[];
}

export interface QuestionAdditionalInfoCtrlButtonProps {
  onClick: () => void;
  curState: boolean;
}

export interface SummarySideNavigationProps {
  entranceKey: string;
  entranceData?: BackendEntrance;
  entrancePlaceData: EntrancePlaceData;
  servicepointData: BackendServicepoint;
  accessibilityData: AccessibilityData;
  accessibilityPlaces: BackendPlace[];
  entranceChoiceData: EntranceChoiceData;
}

export interface ServicepointLandingSummaryContactProps {
  entranceData?: BackendEntrance;
  hasData: boolean;
  hasModifyButton?: boolean;
}

export interface ServicepointLandingSummaryAccessibilityProps {
  entranceKey: string;
  entranceData?: BackendEntrance;
  servicepointData: BackendServicepoint;
  accessibilityData: AccessibilityData;
  hasData: boolean;
  hasModifyButton?: boolean;
}

export interface SummaryAccessibilityProps {
  entranceKey: string;
  sentenceGroupId: string;
  sentenceGroup?: BackendEntranceSentence[];
  entranceChoiceData: EntranceChoiceData;
  hasData: boolean;
}

export interface PreviewPageLandingSummaryProps {
  data: AccessibilityData;
}

export interface ServicepointLandingSummaryContentProps {
  contentHeader?: string;
  children?: JSX.Element;
}

export interface ServicepointLandingSummaryLocationPictureProps {
  entranceKey: string;
  entranceData?: BackendEntrance;
}

export interface SummaryLocationPictureProps {
  entranceKey: string;
  entranceData?: BackendEntrance;
  servicepointData: BackendServicepoint;
}

export interface SummaryAccessibilityPlaceProps {
  entrancePlaceName: string;
  entrancePlaceData?: BackendEntrancePlace[];
}

export interface ServicepointLandingSummaryModifyButtonProps {
  entranceData?: BackendEntrance;
  hasData: boolean;
}

export interface ServicepointLandingSummaryCtrlButtonsProps {
  hasData: boolean;
}

export interface PreviewControlButtonsProps {
  hasSaveDraftButton?: boolean;
  setSendingComplete: Dispatch<SetStateAction<boolean>>;
}

export interface MapProps {
  questionId: number;
  initZoom: number;
  curLocation: [number, number];
  setLocation?: (location: [number, number]) => void;
  draggableMarker?: boolean;
  makeStatic?: boolean;
  isMainLocPicComponent?: boolean;
}

// general for qnumber
export interface AdditionalContentProps {
  onlyLink?: boolean;
  questionId: number;
  compId: number;
  onDelete?: (id?: number, type?: string) => void;
  canDelete?: boolean;
  initValue?: [number, number] | Languages | PictureProps[];
  isMainLocPicComponent?: boolean;
}

export interface MainPictureContentProps {
  onlyLink?: boolean;
  pageId: number;
  onDelete?: (id?: number, type?: string) => void;
  initValue?: MainPictureProps;
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
  invalidValues?: AddinfoInvalidAnswers[];
}

// invalid values 1 per component
// interface AddinfoInvalidValues {
//   id: number;
//   invalidValues?: AddinfoInvalidAnswers;
// }

// invalid answers list of
export interface AddinfoInvalidAnswers {
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
  altText: Languages;
}

export interface MainPictureProps {
  base?: string;
  uuid?: string;
  url?: string;
  name?: string;
  source?: string;
  altText: Languages;
}

export interface AdditionalInfoProps {
  [key: string]: AdditionalInfos;
}

export interface Validation {
  valid: boolean;
  fieldId: string;
  fieldLabel: string;
}

/*
export interface KeyValueValidation {
  [key: string]: Validation;
}
*/

export interface EntranceLocationPhoto {
  entrance_id: number;
  question_block_id: number;
  existingAnswer?: BackendEntranceAnswer;
  modifiedAnswer: BackendEntranceAnswer;
  existingPhotoBase64?: string;
  modifiedPhotoBase64?: string;
  termsAccepted: boolean;
  invalidValues: Validation[];
  canAddLocation: boolean;
  canAddPhoto: boolean;
}

export interface EntrancePlaceBox {
  entrance_id: number;
  place_id: number;
  order_number: number;
  existingBox?: BackendEntrancePlace;
  modifiedBox: BackendEntrancePlace;
  isDeleted: boolean;
  existingPhotoBase64?: string;
  modifiedPhotoBase64?: string;
  termsAccepted: boolean;
  invalidValues: Validation[];
}

export interface AdditionalInfoStateProps {
  initAddInfoFromDb: boolean;
  curEditingInitialState: AdditionalInfoProps;
  additionalInfo: AdditionalInfoProps;
  entranceLocationPhoto: EntranceLocationPhoto;
  entranceLocationPhotoValid: boolean;
  entrancePlaceBoxes: EntrancePlaceBox[];
  entrancePlaceValid: boolean;
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

export interface EntranceFormProps {
  questionsData: BackendQuestion[];
  questionChoicesData: BackendQuestionChoice[];
  questionBlocksData: BackendQuestionBlock[];
  questionBlockFieldData: BackendQuestionBlockField[];
  accessibilityPlaceData: BackendPlace[];
  entranceData: BackendEntrance;
  entrancePlaceData: BackendEntrancePlace[];
  servicepointData: BackendServicepoint;
  questionAnswerData: BackendEntranceAnswer[];
  questionExtraAnswerData: BackendEntranceField[];
  // additionalInfosData: FetchAdditionalInfos;
  formId: number;
  isMainEntrancePublished: boolean;
}

/*
interface FetchAdditionalInfos {
  comments?: QuestionAnswerComment[];
  locations?: QuestionAnswerLocation[];
  photos?: QuestionAnswerPhoto[];
  phototexts?: QuestionAnswerPhotoTxt[];
}
*/
export interface QuestionBlockProps {
  block: BackendQuestionBlock;
  questions?: BackendQuestion[];
  answerChoices?: BackendQuestionChoice[];
  extraFields?: BackendQuestionBlockField[];
  accessibilityPlaces: BackendPlace[];
}

export interface PathTreeProps {
  treeItems: string[];
}

export interface QuestionAdditionalInfoProps {
  questionId: number;
  blockId?: number;
  // canAddLocation?: boolean;
  // canAddPhotoMaxCount?: number;
  // canAddComment?: boolean;
  isMainLocPicComponent?: boolean;
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
  skip?: boolean;
}

export interface NoticeProps {
  icon: JSX.Element;
  title: string;
  text: string;
  button?: JSX.Element;
}

export interface SaveSpinnerProps {
  savingText: string;
  savingFinishedText: string;
}

export interface QuestionBlockLocationPhotoContentProps {
  block: BackendQuestionBlock;
  canAddLocation: boolean;
  canAddPhoto: boolean;
}

export interface EntranceData {
  [key: string]: BackendEntrance;
}

export interface AccessibilityData {
  [key: string]: BackendEntranceSentence[];
}

export interface EntranceChoiceData {
  [key: string]: BackendEntranceChoice[];
}

export interface EntrancePlaceData {
  [key: string]: BackendEntrancePlace[];
}

export interface DetailsProps {
  servicepointData: BackendServicepoint;
  accessibilityData: AccessibilityData;
  accessibilityPlaceData: BackendPlace[];
  entranceData: EntranceData;
  entrancePlaceData: EntrancePlaceData;
  entranceChoiceData: EntranceChoiceData;
  // hasExistingFormData: boolean;
  isMainEntrancePublished: boolean;
}

export interface PreviewProps {
  servicepointData: BackendServicepoint;
  accessibilityData: AccessibilityData;
  accessibilityPlaceData: BackendPlace[];
  entranceData: EntranceData;
  entrancePlaceData: BackendEntrancePlace[];
  entranceChoiceData: BackendEntranceChoice[];
  questionAnswerData: BackendEntranceAnswer[];
  questionExtraAnswerData: BackendEntranceField[];
  isMainEntrancePublished: boolean;
}

export interface EntranceLocationPhotoProps {
  servicepointData: BackendServicepoint;
  entranceData: BackendEntrance;
  formId: number;
}

export interface EntranceLocationProps {
  entranceLocationPhoto: EntranceLocationPhoto;
}

export interface EntrancePhotoProps {
  entranceLocationPhoto: EntranceLocationPhoto;
}

export interface EntranceLocationPhotoCtrlButtonsProps {
  entranceLocationPhoto: EntranceLocationPhoto;
}

export interface AccessibilityPlaceProps {
  servicepointData: BackendServicepoint;
  entranceData: BackendEntrance;
  accessibilityPlaceData: BackendPlace[];
  formId: number;
}

export interface AccessibilityPlaceBoxProps {
  entrancePlaceBox: EntrancePlaceBox;
  canAddLocation: boolean;
}

export interface AccessibilityPlaceLocationProps {
  entrancePlaceBox: EntrancePlaceBox;
}

export interface AccessibilityPlacePictureProps {
  entrancePlaceBox: EntrancePlaceBox;
}

export interface AccessibilityPlaceCtrlButtonsProps {
  placeId: number;
  entrancePlaceBoxes: EntrancePlaceBox[];
}

export interface AccessibilityPlaceNewButtonProps {
  accessibilityPlaceData: BackendPlace;
  orderNumber: number;
}

export interface ElementCountProps {
  comment: number;
  upload: number;
  link: number;
  location: number;
  [key: string]: number;
}
