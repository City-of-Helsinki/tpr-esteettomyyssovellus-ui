// place for general constrants e.g const and enums
// all 'static text' should be here

export const TERMS_URL = "https://myhelsinki.fi/fi/myhelsinki-places-palvelun-käyttöehdot/";
export const ACCESSIBILITY_URL = "https://myhelsinki.fi/fi/saavutettavuusseloste/";
export const CREATIVECOMMONS_URL = "creativecommons.org/licences/by/4.0";

export const API_FETCH_QUESTIONBLOCK_URL = "http://localhost:8000/api/ArBackendQuestionBlocks/?form_id=0&format=json";
export const API_FETCH_QUESTION_URL = "http://localhost:8000/api/ArBackendQuestions/?form_id=0&format=json";
export const API_FETCH_QUESTIONCHOICES = "http://localhost:8000/api/ArBackendQuestionChoice/?form_id=0&format=json";

export enum LANGUAGE_LOCALES {
  fi = 1,
  sv = 2,
  en = 3
}

export default null;
