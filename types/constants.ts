// place for general constrants e.g const and enums
// all 'static text' should be here

export const TERMS_URL = ""; // coming later
export const ACCESSIBILITY_URL = "https://kaupunkialustana.hel.fi/esteettomyyssovelluksen-saavutettavuusseloste/";
export const CREATIVECOMMONS_URL = "creativecommons.org/licences/by/4.0";

export const HKI_GEOCODING_URL = "https://api.hel.fi/servicemap/v2/search/?format=json&type=address&input=";
export const GEOCODING_PARAMS = "&language=fi&only=location";
export const MAP_INITIAL_CENTER = [60.166, 24.942];
export const MAP_INITIAL_ZOOM = 13;
export const MAP_MIN_ZOOM = 10;
export const MAP_MAX_ZOOM = 18;

// The server-side calls should use the local backend directly
// Note: the client-side calls use the full path, which is handled by getOrigin in request.ts
// export const API_URL_BASE = "http://localhost:8000/"; // Development
// export const API_URL_BASE = "http://localhost:82/"; // Test
export const API_URL_BASE = "http://localhost:81/"; // Production

export const API_FETCH_QUESTIONBLOCK_URL = "api/ArBackendQuestionBlocks/";
export const API_FETCH_QUESTION_URL = "api/ArBackendQuestions/";
export const API_FETCH_QUESTIONCHOICES = "api/ArBackendQuestionChoice/";
export const API_FETCH_BACKEND_QUESTIONBLOCK_FIELD = "api/ArBackendQuestionBlockField/";
export const API_FETCH_SYSTEMS = "api/ArSystems/";
export const API_FETCH_SERVICEPOINTS = "api/ArServicepoints/";
export const API_FETCH_BACKEND_SERVICEPOINT = "api/ArBackendServicepoint/";
export const API_FETCH_ANSWER_LOGS = "api/ArXAnswerLog/";
export const API_FETCH_QUESTION_ANSWERS = "api/ArXQuestionAnswer/";
export const API_CHOP_ADDRESS = "api/ChopAddress/";
export const API_GENERATE_SENTENCES = "api/GenerateSentences/";
export const API_DISPLAY_ENTRANCE_WITH_MAP = "api/DisplayEntranceWithMap/";
export const API_FETCH_ENTRANCES = "api/ArEntrances/";
export const API_FETCH_BACKEND_ENTRANCE = "api/ArBackendEntrance/";
export const API_FETCH_BACKEND_ENTRANCE_ANSWERS = "api/ArBackendEntranceAnswer/";
export const API_FETCH_BACKEND_ENTRANCE_FIELD = "api/ArBackendEntranceField/";
export const API_FETCH_BACKEND_ENTRANCE_SENTENCE_GROUPS = "api/ArBackendEntranceSentenceGroup/";
export const API_FETCH_QUESTION_BLOCK_ANSWER_FIELD = "api/ArXQuestionBlockAnswerField/";
export const API_FETCH_COPYABLE_ENTRANCE = "api/ArBackendCopyableEntrance/";
export const API_FETCH_BACKEND_QUESTIONS = "api/ArBackendQuestions/";
export const API_FETCH_BACKEND_ENTRANCE_CHOICES = "api/ArBackendEntranceChoice/";
export const API_FETCH_BACKEND_SENTENCES = "api/ArBackendEntranceSentence/";
export const API_FETCH_SYSTEM_FORMS = "api/ArSystemForms/";
export const API_FETCH_EXTERNAL_SERVICEPOINTS = "api/ArExternalServicepoint/";
export const API_FETCH_BACKEND_EXTERNAL_SERVICEPOINTS = "api/ArBackendExternalServicepoint/";
export const API_FETCH_BACKEND_PLACES = "api/ArBackendPlace/";
export const API_FETCH_BACKEND_ENTRANCE_PLACES = "api/ArBackendEntrancePlace/";
export const API_FETCH_BACKEND_FORM = "api/ArBackendForm/";
export const API_FETCH_BACKEND_FORM_GUIDE = "api/ArBackendFormGuide/";
export const API_SAVE_PLACE_ANSWER = "api/ArXPlaceAnswer/";
export const API_SAVE_PLACE_ANSWER_BOX = "api/ArXPlaceAnswerBox/";
export const API_SAVE_PLACE_ANSWER_BOX_TEXT = "api/ArXPlaceAnswerBoxTxt/";
export const API_SAVE_QUESTION_BLOCK_ANSWER = "api/ArXQuestionBlockAnswer/";
export const API_SAVE_QUESTION_BLOCK_ANSWER_TEXT = "api/ArXQuestionBlockAnswerTxt/";
export const API_SAVE_QUESTION_BLOCK_COMMENT = "api/ArXQuestionBlockAnswerCmt/";
export const API_AZURE_UPLOAD = "api/azure_upload/";
export const API_DELETE_PLACE_BOX_TEXT_SUFFIX = "delete_box_txts/";
export const API_DELETE_PLACE_FROM_ANSWER = "api/DeletePlaceFromAnswer/";

export enum LanguageLocales {
  fi = 1,
  sv = 2,
  en = 3,
}

export enum Toast {
  NotAuthenticated = "notAuthenticated",
  ValidationFailed = "validationFailed",
  SaveFailed = "saveFailed",
  SaveSucceeded = "saveSucceeded",
  RejectSucceeded = "rejectSucceeded",
  DeleteSucceeded = "deleteSucceeded",
}

export const PHONE_REGEX = /^[^a-zA-Z]+$/;
export const EMAIL_REGEX =
  /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;

export const PHOTO_FILE_TYPES = ".jpg,.jpeg,.png";
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export default null;
