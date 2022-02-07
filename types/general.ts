// place for custom typescript interfaces/"models"

import { LatLngExpression } from "leaflet";
import {
  BackendEntrance,
  BackendEntranceAnswer,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionBlockField,
  BackendQuestionChoice,
  BackendServicepoint,
  EntranceResults,
  QuestionAnswerComment,
  QuestionAnswerLocation,
  QuestionAnswerPhoto,
  QuestionAnswerPhotoTxt,
  Servicepoint,
  StoredSentence,
} from "./backendModels";

export interface QuestionContainerProps {
  questionId: number;
  questionBlockId: number;
  questionNumber?: number | string;
  questionText?: string;
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

export interface QuestionExtraFieldProps {
  questionBlockId: number;
  fieldNumber?: number;
  questionText?: string;
  questionInfo?: string | null;
  isMandatory: boolean;
  children: JSX.Element;
  backgroundColor: string;
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

export interface DropdownQuestionProps {
  options?: InputOption[];
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

export interface QuestionsListProps {
  additionalInfoVisible: boolean;
  questions?: BackendQuestion[] | null;
  answers?: BackendQuestionChoice[] | null;
}

export interface QuestionBlockExtraFieldListProps {
  extraFields?: BackendQuestionBlockField[] | null;
  answers?: BackendQuestionChoice[] | null;
}

export interface QuestionAdditionalInfoCtrlButtonProps {
  onClick: () => void;
  curState: boolean;
}

export interface ServicepointLandingSummaryContactProps {
  servicepointData: Servicepoint;
  entranceData?: BackendEntrance;
  hasData: boolean;
}

export interface ServicepointLandingSummaryAccessibilityProps {
  entranceKey: string;
  entranceData?: BackendEntrance;
  servicepointData: Servicepoint;
  accessibilityData: AccessibilityData;
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

export interface ServicepointLandingSummaryNewButtonProps {
  servicepointData: Servicepoint;
}

export interface ServicepointLandingSummaryModifyButtonProps {
  servicepointData: Servicepoint;
  entranceData?: BackendEntrance;
  hasData: boolean;
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
interface AddinfoInvalidAnswers {
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
  questionsData: BackendQuestion[];
  questionChoicesData: BackendQuestionChoice[];
  questionBlocksData: BackendQuestionBlock[];
  questionBlockFieldData: BackendQuestionBlockField[];
  entranceData: BackendEntrance;
  servicepointData: Servicepoint;
  questionAnswerData: BackendEntranceAnswer[];
  additionalInfosData: FetchAdditionalInfos;
  formId: number;
  // entrance_id: string;
}

interface FetchAdditionalInfos {
  comments?: QuestionAnswerComment[];
  locations?: QuestionAnswerLocation[];
  photos?: QuestionAnswerPhoto[];
  phototexts?: QuestionAnswerPhotoTxt[];
}

export interface QuestionBlockProps {
  questions?: BackendQuestion[] | null;
  answers?: BackendQuestionChoice[] | null;
  extraFields?: BackendQuestionBlockField[] | null;
  description?: string | null;
  photoUrl?: string | null;
  photoText?: string | null;
}

export interface PathTreeProps {
  treeItems: (string | undefined)[];
}

export interface QuestionAdditionalInfoProps {
  questionId: number;
  blockId?: number;
  canAddLocation?: boolean;
  canAddPhotoMaxCount?: number;
  canAddComment?: boolean;
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
}

export interface NoticeProps {
  icon: JSX.Element;
  title: string;
  text: string;
  button?: JSX.Element;
}

export interface MainLocationAndPictureProps {
  canAddLocation: boolean;
  canAddPicture: boolean;
}

export interface EntranceData {
  [key: string]: BackendEntrance;
}

export interface AccessibilityData {
  [key: string]: StoredSentence[];
}

export interface DetailsProps {
  servicepointData: Servicepoint;
  servicepointDetail: BackendServicepoint;
  accessibilityData: AccessibilityData;
  entranceData: EntranceData;
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
