import crypto from "crypto";
import {
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceField,
  BackendEntrancePlace,
  Entrance,
  ExternalBackendServicepoint,
  Servicepoint,
} from "../types/backendModels";
import {
  API_FETCH_BACKEND_EXTERNAL_SERVICEPOINTS,
  API_FETCH_ENTRANCES,
  API_FETCH_EXTERNAL_SERVICEPOINTS,
  API_FETCH_SERVICEPOINTS,
  API_URL_BASE,
} from "../types/constants";
import { API_TOKEN } from "./checksumSecret";
import { getCurrentDate, getTokenHash, validateChecksum } from "./utilFunctions";

export const getServicepointIdFromTargetId = async (targetId?: string | string[]): Promise<number> => {
  // Target id examples:
  //   tpr:5304
  //   ptv:7b5f2481-a80f-4773-8a95-bb7a43fc7a21

  let servicepointId = 0;

  if (targetId !== undefined) {
    const externalServicePointResp = await fetch(
      `${API_URL_BASE}${API_FETCH_BACKEND_EXTERNAL_SERVICEPOINTS}?external_servicepoint_id=${targetId}&format=json`,
      {
        headers: new Headers({ Authorization: getTokenHash() }),
      }
    );
    const externalServicePointData = await (externalServicePointResp.json() as Promise<ExternalBackendServicepoint[]>);

    if (externalServicePointData?.length > 0) {
      servicepointId = externalServicePointData[0].servicepoint_id;
    }
  }

  return servicepointId;
};

export const getServicepointHash = (servicepointId: number): string => {
  return crypto
    .createHash("sha256")
    .update(API_TOKEN + servicepointId)
    .digest("hex")
    .toUpperCase();
};

export const validateServicepointHash = (servicepointId: number, checksum?: string | string[]): boolean => {
  if (servicepointId > 0 && !!checksum) {
    const checksumString = API_TOKEN + servicepointId;
    return validateChecksum(checksumString, checksum as string);
  } else {
    return false;
  }
};

export const createServicePoint = async (
  systemId: string,
  servicePointName: string,
  externalServicePointId: string,
  user: string,
  baseUrl: string,
  locationId?: string,
  streetName?: string,
  streetNumber?: string,
  postOffice?: string,
  easting?: number,
  northing?: number
): Promise<number> => {
  const date = getCurrentDate();

  console.log("Create new servicepoint");

  const servicepointRequestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    body: JSON.stringify({
      business_id: null,
      organisation_code: null,
      system_id_old: null,
      servicepoint_name: servicePointName,
      ext_servicepoint_id: externalServicePointId,
      created: date,
      created_by: user,
      modified: date,
      modified_by: user,
      address_street_name: streetName,
      address_no: streetNumber,
      address_city: postOffice,
      is_searchable: "Y",
      organisation_id: systemId,
      loc_easting: easting,
      loc_northing: northing,
      location_id: locationId || null,
      system: systemId,
    }),
  };

  const newServicepointResp = await fetch(`${baseUrl}${API_FETCH_SERVICEPOINTS}`, servicepointRequestOptions);
  const newServicepointData = await (newServicepointResp.json() as Promise<Servicepoint>);
  const servicepointId = newServicepointData.servicepoint_id;
  console.log("Created new servicepoint", servicepointId);

  const externalServicepointOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    body: JSON.stringify({
      external_servicepoint_id: externalServicePointId,
      created: date,
      created_by: user,
      system: systemId,
      servicepoint: servicepointId,
    }),
  };

  await fetch(`${baseUrl}${API_FETCH_EXTERNAL_SERVICEPOINTS}`, externalServicepointOptions);
  console.log("Created new external servicepoint");

  return servicepointId;
};

export const createEntrance = async (
  servicepointId: number,
  formId: number,
  user: string,
  baseUrl: string,
  easting?: number,
  northing?: number
): Promise<number> => {
  if (servicepointId > 0) {
    const date = getCurrentDate();

    console.log("Create new entrance");

    const entranceRequestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
      body: JSON.stringify({
        name_fi: "",
        name_sv: null,
        name_en: null,
        loc_easting: easting,
        loc_northing: northing,
        photo_url: null,
        streetview_url: null,
        created: date,
        created_by: user,
        modified: date,
        modified_by: user,
        is_main_entrance: "Y",
        servicepoint: servicepointId,
        form: formId,
      }),
    };

    const newEntranceResp = await fetch(`${baseUrl}${API_FETCH_ENTRANCES}`, entranceRequestOptions);
    const newEntranceData = await (newEntranceResp.json() as Promise<Entrance>);
    const entranceId = newEntranceData.entrance_id;
    console.log("Created new entrance", entranceId);

    return entranceId;
  }

  return -1;
};

type dataTypeForLogId = BackendEntrance | BackendEntranceAnswer | BackendEntranceField | BackendEntrancePlace;

const getMaxFormLogId = (data: dataTypeForLogId[], formSubmitted: "Y" | "D"): number => {
  // Return the highest log id for either published or draft data (form_submitted = 'Y' or 'D')
  const logIds = data
    .filter((obj) => {
      return obj.form_submitted === formSubmitted;
    })
    .sort((a: dataTypeForLogId, b: dataTypeForLogId) => {
      return (b.log_id ?? 0) - (a.log_id ?? 0);
    });

  return logIds.length > 0 ? logIds[0].log_id ?? -1 : -1;
};

export const getMaxLogId = (data: dataTypeForLogId[]): number => {
  // Return the 'best' highest log id for the data, so that the question form shows sensible data
  // If published data exists (form_submitted = 'Y'), then preferably use that
  // If only draft data exists (form_submitted = 'D'), for example if the data is for a new location, then use that instead
  const maxLogIdY = getMaxFormLogId(data, "Y");
  const maxLogIdD = getMaxFormLogId(data, "D");

  return maxLogIdY > 0 ? maxLogIdY : maxLogIdD;
};
