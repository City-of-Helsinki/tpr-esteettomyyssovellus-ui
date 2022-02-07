// Tables
export interface System {
  system_id: string;
  name: string;
  checksum_secret: string;
}

export interface SystemForm {
  system: string;
  form: number;
}

export interface Servicepoint {
  servicepoint_id: number;
  business_id?: string;
  organisation_code?: string;
  system_id_old?: string;
  servicepoint_name?: string;
  ext_servicepoint_id: string;
  created: Date;
  created_by: string;
  modified: Date;
  modified_by: string;
  address_street_name?: string;
  address_no?: string;
  address_city?: string;
  accessibility_phone?: string;
  accessibility_email?: string;
  accessibility_www?: string;
  is_searchable: string;
  organisation_id?: string;
  system?: string;
  loc_easting?: number;
  loc_northing?: number;
  location_id?: string;
  [key: string]: number | string | Date | undefined;
}

export interface ExternalServicepoint {
  external_servicepoint_id: string;
  system: string;
  servicepoint: number;
  created: Date;
  id: number;
  created_by: string;
}

export interface Entrance {
  entrance_id: number;
  name_fi?: string;
  name_sv?: string;
  name_en?: string;
  loc_easting?: number;
  loc_northing?: number;
  photo_url?: string;
  streetview_url?: string;
  created: Date;
  created_by: string;
  modified: Date;
  modified_by: string;
  is_main_entrance: string;
  servicepoint: number;
  form: number;
}

export interface EntranceResults {
  results: Entrance[];
}

export interface StoredSentence {
  entrance_id: number;
  log_id: number;
  language_code: string;
  sentence_group_id: number;
  sentence_group_name: string;
  question_block_id: number;
  question_block_name: string;
  sentence_id: number;
  sentence_order_text: string;
  sentence?: string;
  stored?: Date;
  form_submitted?: string;
}

export interface AnswerLog {
  log_id: number;
  entrance: number;
  ip_address?: string;
  started_answering?: Date;
  finished_answering?: Date;
  form_submitted?: string;
  form_cancelled?: string;
  accessibility_editor?: string;
}

export interface QuestionAnswerComment {
  answer_comment_id: number;
  log: number;
  question: number;
  language: number;
  comment?: string;
}

export interface QuestionAnswerLocation {
  answer_location_id: number;
  log: number;
  question: number;
  loc_easting?: number;
  loc_northing?: number;
}

export interface QuestionAnswerPhoto {
  answer_photo_id: number;
  log: number;
  question: number;
  photo_url?: string;
}

export interface QuestionAnswerPhotoTxt {
  answer_photo_txt_id: number;
  answer_photo: number;
  language: number;
  photo_text?: string;
}

// Views
// Note: Optional id fields have been changed to mandatory according to the underlying sql of the backend views
export interface BackendServicepoint {
  technical_id: string;
  log_id: number;
  servicepoint_id: number;
  main_entrance_id: number;
  form_submitted?: string;
  contact_person_fi?: string;
  contact_person_sv?: string;
  contact_person_en?: string;
  accessibility_phone?: string;
  accessibility_email?: string;
  new_entrance_possible: string;
}

export interface BackendEntrance {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted: string;
  loc_easting?: number;
  loc_northing?: number;
  photo_url?: string;
  name_fi?: string;
  name_sv?: string;
  name_en?: string;
  [key: string]: number | string | undefined;
}

export interface BackendEntranceAnswer {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  question_block_id: number;
  question_id?: number;
  question_choice_id?: number;
  loc_easting?: number;
  loc_northing?: number;
  comment_fi?: string;
  comment_sv?: string;
  comment_en?: string;
  photo_url?: string;
  photo_text_fi?: string;
  photo_text_sv?: string;
  photo_text_en?: string;
}

export interface BackendQuestion {
  technical_id: string;
  form_id: number;
  language_id: number;
  question_block_id: number;
  question_id: number;
  question_code?: string;
  text?: string;
  visible_if_question_choice?: string;
  question_level?: number;
  question_order_text?: string;
  description?: string;
  photo_url?: string;
  photo_text?: string;
  yes_no_question?: string;
  can_add_location?: string;
  can_add_photo_max_count?: number;
  can_add_comment?: string;
}

export interface BackendQuestionBlock {
  technical_id: string;
  form_id: number;
  language_id: number;
  question_block_id: number;
  question_block_code?: string;
  text?: string;
  visible_if_question_choice?: string;
  question_block_order_text?: string;
  description?: string;
  photo_url?: string;
  photo_text?: string;
}

export interface BackendQuestionBlockField {
  technical_id: string;
  form_id: number;
  language_id: number;
  question_block_id: number;
  field_number: number;
  field_name?: string;
  field_title?: string;
  obligatory?: string;
  description?: string;
}

export interface BackendQuestionChoice {
  technical_id: string;
  form_id: number;
  language_id: number;
  question_block_id: number;
  question_id: number;
  question_choice_id: number;
  text?: string;
  choice_order_text?: string;
}
