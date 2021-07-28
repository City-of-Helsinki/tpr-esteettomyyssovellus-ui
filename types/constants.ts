// place for general constrants e.g const and enums
// all 'static text' should be here

export const TERMS_URL =
  "https://myhelsinki.fi/fi/myhelsinki-places-palvelun-käyttöehdot/";
export const ACCESSIBILITY_URL =
  "https://myhelsinki.fi/fi/saavutettavuusseloste/";
export const CREATIVECOMMONS_URL = "creativecommons.org/licences/by/4.0";

export const backendApiBaseUrl = "http://localhost:8000/api";

export const API_FETCH_QUESTIONBLOCK_URL = `${backendApiBaseUrl}/ArBackendQuestionBlocks/?format=json&form_id=`;
export const API_FETCH_QUESTION_URL = `${backendApiBaseUrl}/ArBackendQuestions/?format=json&form_id=`;
export const API_FETCH_QUESTIONCHOICES = `${backendApiBaseUrl}/ArBackendQuestionChoice/?format=json&form_id=`;
// export const API_FETCH_ADDITIONALINFOS = `${backendApiBaseUrl}/ArXAdditionalinfo/`;

export const API_URL_BASE = "http://localhost:8000/api/";

export const FRONT_URL_BASE = "http://localhost:3000/";

export enum LANGUAGE_LOCALES {
  fi = 1,
  sv = 2,
  en = 3
}

export const PHONE_REGEX = /^[^a-zA-Z]+$/;
export const EMAIL_REGEX = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;

export default null;
