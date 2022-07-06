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

// Servicepoint - use in details and preview pages
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
  // accessibility_phone?: string;
  // accessibility_email?: string;
  // accessibility_www?: string;
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

/*
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
*/

export interface QuestionBlockAnswerCmt {
  question_block_answer_cmt_id: number;
  log_id: number;
  question_block_id: number;
  language_id: number;
  comment?: string;
}

// Views
// Note: Optional id fields have been changed to mandatory according to the underlying sql of the backend views

// BackendServicepoint - use in details and preview pages
export interface BackendServicepoint {
  technical_id: string;
  log_id: number;
  servicepoint_id: number;
  servicepoint_name?: string; // v0.6
  address_street_name?: string; // v0.6
  address_no?: string; // v0.6
  address_city?: string; // v0.6
  loc_easting?: number; // v0.6
  loc_northing?: number; // v0.6
  main_entrance_id: number;
  form_submitted?: string;
  contact_person_fi?: string;
  contact_person_sv?: string;
  contact_person_en?: string;
  accessibility_phone?: string;
  accessibility_email?: string;
  new_entrance_possible: string;
  entrance_count?: number;
  finished_entrance_count?: number;
  modified?: Date;
  [key: string]: number | string | Date | undefined;
}

// BackendEntrance - use in details and preview pages
export interface BackendEntrance {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  servicepoint_id: number; // v0.6
  form_submitted: string;
  loc_easting?: number;
  loc_northing?: number;
  photo_url?: string;
  photo_source_text?: string; // v0.6
  photo_text_fi?: string; // v0.6
  photo_text_sv?: string; // v0.6
  photo_text_en?: string; // v0.6
  name_fi?: string;
  name_sv?: string;
  name_en?: string;
  contact_person_fi?: string;
  contact_person_sv?: string;
  contact_person_en?: string;
  accessibility_phone?: string;
  accessibility_email?: string;
  modified?: Date;
  [key: string]: number | string | Date | undefined;
}

// BackendCopyableEntrance - use in accessibility form page
export interface BackendCopyableEntrance {
  technical_id: string;
  entrance_id: number;
  question_block_id: number;
  copyable_entrance_id: number;
  copyable_servicepoint_name: string;
}

// BackendEntranceAnswer - use in accessibility form page
export interface BackendEntranceAnswer {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  question_block_id: number;
  question_id?: number;
  question_choice_id?: number;
  // The following values are only used when question_id is null
  loc_easting?: number;
  loc_northing?: number;
  comment_fi?: string;
  comment_sv?: string;
  comment_en?: string;
  photo_url?: string;
  photo_source_text?: string; // v0.6
  photo_text_fi?: string;
  photo_text_sv?: string;
  photo_text_en?: string;
  [key: string]: number | string | undefined;
}

// BackendEntranceField - use in accessibility form page
export interface BackendEntranceField {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  question_block_id: number;
  question_block_field_id: number;
  field_number?: number;
  entry?: string;
}

// BackendEntranceChoice - use in details and preview pages - v0.6
export interface BackendEntranceChoice {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  language_id: number;
  sentence_group_id?: number;
  sentence_group_name?: string;
  question_block_id: number;
  question_block_code?: string;
  question_block_text?: string;
  question_id: number;
  question_code?: string;
  question_text?: string;
  question_order_text?: string;
  question_choice_id: number;
  question_choice_text?: string;
}

// BackendEntrancePlace - use in details and preview pages - v0.6
export interface BackendEntrancePlace {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  question_block_id: number; // v0.8
  sentence_group_id?: number;
  place_id: number;
  box_id?: number;
  order_number?: number;
  loc_easting?: number;
  loc_northing?: number;
  location_text_fi?: string;
  location_text_sv?: string;
  location_text_en?: string;
  photo_url?: string;
  photo_source_text?: string;
  photo_text_fi?: string;
  photo_text_sv?: string;
  photo_text_en?: string;
  [key: string]: number | string | undefined;
}

// BackendEntranceSentence - use in details and preview pages - v0.6
export interface BackendEntranceSentence {
  technical_id: string;
  log_id: number;
  entrance_id: number;
  form_submitted?: string;
  language_id: number;
  sentence_group_id: number;
  sentence_group_name: string;
  sentence_type: string;
  sentence_id: number;
  parent_sentence_id?: number;
  sentence_order_text: string;
  sentence?: string;
}

// BackendForm - use in accessibility form page
export interface BackendForm {
  form_id: number;
  language_id: number;
  text?: string;
  description?: string;
}

// BackendQuestion - use in accessibility form page
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
  guide_title?: string; // 0.8
  guide_url?: string; // 0.8
  yes_no_question?: string;
  // can_add_location?: string;
  // can_add_photo_max_count?: number;
  // can_add_comment?: string;
  place_visible_if_question_choice?: string; // v0.6
}

// BackendQuestionBlock - use in accessibility form page
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
  field_count: number; // v0.4
  add_location_possible?: string; // v0.4
  add_location_title?: string; // v0.4
  add_location_description?: string; // v0.4
  add_photo_possible?: string; // v0.4
  add_photo_title?: string; // v0.4
  add_photo_description?: string; // v0.4
  show_details_in_titlebar?: string; // v0.4
  add_comment_possible?: string; // v0.6
  put_fields_before_questions?: string; // 0.7
  guide_title?: string; // 0.9
  guide_url?: string; // 0.9
}

// BackendQuestionBlockField - use in accessibility form page
export interface BackendQuestionBlockField {
  technical_id: string;
  form_id: number;
  language_id: number;
  question_block_id: number;
  question_block_field_id: number;
  field_number: number;
  field_name?: string;
  field_title?: string;
  obligatory?: string;
  description?: string;
}

// BackendQuestionChoice - use in accessibility form page
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

// BackendPlace - use in accessibility form page - v0.6
export interface BackendPlace {
  technical_id: string;
  place_id: number;
  language_id: number;
  name?: string;
  description?: string;
  can_add_location?: string;
}

// BackendFormGuide - use in accessibility form page - v0.9
export interface BackendFormGuide {
  technical_id: string;
  form_id: number;
  language_id: number;
  guide_id: number;
  guide_icon?: string;
  description?: string;
  guide_title?: string;
  guide_url?: string;
}
