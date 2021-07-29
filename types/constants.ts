// place for general constrants e.g const and enums
// all 'static text' should be here

export const TERMS_URL =
  "https://myhelsinki.fi/fi/myhelsinki-places-palvelun-käyttöehdot/";
export const ACCESSIBILITY_URL =
  "https://myhelsinki.fi/fi/saavutettavuusseloste/";
export const CREATIVECOMMONS_URL = "creativecommons.org/licences/by/4.0";

export const API_URL_BASE = "http://localhost:8000/api/";

export const FRONT_URL_BASE = "http://localhost:3000/";

export const API_FETCH_QUESTIONBLOCK_URL = `${API_URL_BASE}ArBackendQuestionBlocks/?format=json&form_id=`;
export const API_FETCH_QUESTION_URL = `${API_URL_BASE}ArBackendQuestions/?format=json&form_id=`;
export const API_FETCH_QUESTIONCHOICES = `${API_URL_BASE}ArBackendQuestionChoice/?format=json&form_id=`;
export const API_FETCH_SYSTEMS = `${API_URL_BASE}ArSystems/?format=json&system_id=`;
export const API_FETCH_SERVICEPOINTS = `${API_URL_BASE}ArServicepoints/`;
export const API_FETCH_ANSWER_LOGS = `${API_URL_BASE}ArXAnswerLog/`;
export const API_FETCH_QUESTION_ANSWERS = `${API_URL_BASE}ArXQuestionAnswer/`;
export const API_CHOP_ADDRESS = `${API_URL_BASE}ChopAddress/`;
export const API_FETCH_ENTRANCES = `${API_URL_BASE}ArEntrances/`;
export const API_FETCH_BACKEND_ENTRANCE_ANSWERS = `${API_URL_BASE}ArBackendEntranceAnswer/`;
export const API_FETCH_QUESTION_ANSWER_COMMENTS = `${API_URL_BASE}ArXQuesitonAnswerComment/`;
export const API_FETCH_QUESTION_ANSWER_LOCATIONS = `${API_URL_BASE}ArXQuesitonAnswerLocation/`;
export const API_FETCH_QUESTION_ANSWER_PHOTOS = `${API_URL_BASE}ArXQuesitonAnswerPhoto/`;
export const API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS = `${API_URL_BASE}ArXQuesitonAnswerPhotoTxt/`;
export const API_FETCH_BACKEND_QUESTIONS = `${API_URL_BASE}ArBackendQuestions/`;
export const API_FETCH_SENTENCE_LANGS = `${API_URL_BASE}ArXStoredSentenceLangs/`;
// export const API_FETCH_ADDITIONALINFOS = `${backendApiBaseUrl}/ArXAdditionalinfo/`;

export enum LANGUAGE_LOCALES {
  fi = 1,
  sv = 2,
  en = 3
}

export const PHONE_REGEX = /^[^a-zA-Z]+$/;
export const EMAIL_REGEX = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;

export default null;
