import { ExternalBackendServicepoint } from "../types/backendModels";
import { API_FETCH_BACKEND_EXTERNAL_SERVICEPOINTS, API_URL_BASE } from "../types/constants";
import { getTokenHash } from "./utilFunctions";

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
