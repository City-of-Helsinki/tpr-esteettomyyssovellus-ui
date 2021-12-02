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
