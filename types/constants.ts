// place for general constrants e.g const and enums
// all 'static text' should be here

export const TERMS_URL = "https://myhelsinki.fi/fi/myhelsinki-places-palvelun-käyttöehdot/";
export const ACCESSIBILITY_URL = "https://myhelsinki.fi/fi/saavutettavuusseloste/";
export const CREATIVECOMMONS_URL = "creativecommons.org/licences/by/4.0";

export const HKI_GEOCODING_URL = "https://api.hel.fi/servicemap/v2/search/?format=json&type=address&input=";
export const GEOCODING_PARAMS = "&language=fi&only=location";

// The server-side calls should use the local backend directly
// Note: the client-side calls use the full path, which is handled by getOrigin in request.ts
export const API_URL_BASE = "http://localhost:8000/";

export const API_FETCH_QUESTIONBLOCK_URL = "api/ArBackendQuestionBlocks/?format=json&form_id=";
export const API_FETCH_QUESTION_URL = "api/ArBackendQuestions/?format=json&form_id=";
export const API_FETCH_QUESTIONCHOICES = "api/ArBackendQuestionChoice/?format=json&form_id=";
export const API_FETCH_BACKEND_QUESTIONBLOCK_FIELD = "api/ArBackendQuestionBlockField/?format=json&form_id=";
export const API_FETCH_SYSTEMS = "api/ArSystems/?format=json&system_id=";
export const API_FETCH_SERVICEPOINTS = "api/ArServicepoints/";
export const API_FETCH_BACKEND_SERVICEPOINT = "api/ArBackendServicepoint/";
export const API_FETCH_ANSWER_LOGS = "api/ArXAnswerLog/";
export const API_FETCH_QUESTION_ANSWERS = "api/ArXQuestionAnswer/";
export const API_CHOP_ADDRESS = "api/ChopAddress/";
export const API_GENERATE_SENTENCES = "api/GenerateSentences/";
export const API_FETCH_ENTRANCES = "api/ArEntrances/";
export const API_FETCH_BACKEND_ENTRANCE = "api/ArBackendEntrance/";
export const API_FETCH_BACKEND_ENTRANCE_ANSWERS = "api/ArBackendEntranceAnswer/";
export const API_FETCH_BACKEND_ENTRANCE_FIELD = "api/ArBackendEntranceField/";
export const API_FETCH_QUESTION_BLOCK_ANSWER_FIELD = "api/ArXQuestionBlockAnswerField/";
// export const API_FETCH_QUESTION_ANSWER_COMMENTS = "api/ArXQuestionAnswerComment/";
// export const API_FETCH_QUESTION_ANSWER_LOCATIONS = "api/ArXQuestionAnswerLocation/";
// export const API_FETCH_QUESTION_ANSWER_PHOTOS = "api/ArXQuestionAnswerPhoto/";
// export const API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS = "api/ArXQuestionAnswerPhotoTxt/";
export const API_FETCH_BACKEND_QUESTIONS = "api/ArBackendQuestions/";
export const API_FETCH_SENTENCE_LANGS = "api/ArXStoredSentenceLangs/";
export const API_FETCH_SYSTEM_FORMS = "api/ArSystemForms/";
export const API_FETCH_EXTERNAL_SERVICEPOINTS = "api/ArExternalServicepoint/";

export enum LanguageLocales {
  fi = 1,
  sv = 2,
  en = 3,
}

// from marketing, all values might not be used/needed, also if Toast not used -> delete
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

export default null;
