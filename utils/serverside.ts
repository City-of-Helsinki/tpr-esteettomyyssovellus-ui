import { ExternalServicepoint, System } from "../types/backendModels";
import { API_FETCH_EXTERNAL_SERVICEPOINTS, API_FETCH_SYSTEMS, API_URL_BASE } from "../types/constants";
import { getTokenHash } from "./utilFunctions";

export const getServicepointIdFromTargetId = async (targetId?: string | string[]): Promise<number> => {
  // Target id examples:
  //   tpr test:5304
  //   ptv test:7b5f2481-a80f-4773-8a95-bb7a43fc7a21

  let servicepointId = 0;

  if (targetId !== undefined) {
    const targetSplit = (targetId as string).split(":");

    if (targetSplit.length === 2) {
      const systemName = targetSplit[0];
      const externalServicePointId = targetSplit[1];

      const systemResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEMS}?name=${systemName.toUpperCase()}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemData = await (systemResp.json() as Promise<System[]>);

      if (systemData?.length > 0) {
        const systemId = systemData[0].system_id;

        const externalServicePointResp = await fetch(
          `${API_URL_BASE}${API_FETCH_EXTERNAL_SERVICEPOINTS}?system_id=${systemId}&external_servicepoint_id=${externalServicePointId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const externalServicePointData = await (externalServicePointResp.json() as Promise<ExternalServicepoint[]>);

        if (externalServicePointData?.length > 0) {
          servicepointId = externalServicePointData[0].servicepoint;
        }
      }
    }
  }

  return servicepointId;
};
