import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "../components/common/Layout";
import LoadSpinner from "../components/common/LoadSpinner";
import { useAppDispatch } from "../state/hooks";
import { setUser } from "../state/reducers/generalSlice";
import { EntranceResults, ExternalServicepoint, Servicepoint, System, SystemForm } from "../types/backendModels";
import {
  API_FETCH_ENTRANCES,
  API_FETCH_EXTERNAL_SERVICEPOINTS,
  API_FETCH_SERVICEPOINTS,
  API_FETCH_SYSTEMS,
  API_FETCH_SYSTEM_FORMS,
  API_URL_BASE,
} from "../types/constants";
import { TargetProps } from "../types/general";
import i18nLoader from "../utils/i18n";
import { createEntrance, createServicePoint } from "../utils/serverside";
import { getCurrentDate, getTokenHash, validateChecksum, validateDate } from "../utils/utilFunctions";

const Target = ({ servicepointId, entranceId, user, skip }: TargetProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (user !== undefined) {
    dispatch(setUser(user));
  }

  // IS THE LANGUAGECODE A NUMBER OR A STRING???
  // console.log(languageCode);

  if (skip) {
    router.push(`/entranceAccessibility/${servicepointId}/${entranceId}`);
  }

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content">
        {!skip && <h1>{i18n.t("AddressChangedPage.errorHasOccured")}</h1>}

        {skip && <LoadSpinner />}
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ locales, query }) => {
  const lngDict = await i18nLoader(locales);

  // GET app/{language code}/target/?
  // systemId={systemId}         => system
  // &targetId ={targetId}       => ext_servicepoint_id
  // &locationId ={locationId}   => location_id
  // &user={user}                => user
  // &validUntil={validUntil}    => ???
  // &name={name}                => name
  // &formId={formId}            => 2
  // &checksum={checksum}        => ???

  // let languageCode = "";
  // if (params !== undefined && params.) {
  //   const languageCode = params.params!.languageCode;
  // }
  if (query !== undefined) {
    if (
      // CHECK URL PARAMS
      query.systemId === undefined ||
      query.targetId === undefined ||
      // query.locationId === undefined ||
      query.user === undefined ||
      query.validUntil === undefined ||
      query.name === undefined ||
      query.formId === undefined ||
      query.checksum === undefined
    ) {
      return {
        props: {
          lngDict,
        },
      };
    }

    // CHECK PARAMS AND REDIRECT
    try {
      const queryParams = {
        systemId: query.systemId as string,
        targetId: query.targetId as string,
        locationId: query.locationId as string,
        user: query.user as string,
        validUntil: query.validUntil as string,
        name: query.name as string,
        formId: query.formId as string,
        checksum: query.checksum as string,
      };

      const systemResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEMS}?format=json&system_id=${queryParams.systemId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemData = await (systemResp.json() as Promise<System[]>);

      const checksumSecret = systemData && systemData.length > 0 ? systemData[0].checksum_secret : undefined;
      const checksum = checksumSecret ?? "";
      const checksumString =
        checksum + queryParams.systemId + queryParams.targetId + queryParams.user + queryParams.name + queryParams.formId + queryParams.validUntil;

      const checksumIsValid = validateChecksum(checksumString, queryParams.checksum);
      const validUntilDateIsValid = validateDate(queryParams.validUntil);

      if (!checksumIsValid || !validUntilDateIsValid) {
        console.log(!validUntilDateIsValid ? "Date not valid" : "Checksums did not match.");
        return {
          props: {
            lngDict,
          },
        };
      }
      console.log("Checksums matched, validUntil date is valid.");

      const systemFormResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEM_FORMS}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemFormData = await (systemFormResp.json() as Promise<SystemForm[]>);

      const canUseForm = systemFormData.some(
        (system: SystemForm) => system.system === queryParams.systemId && system.form === Number(queryParams.formId)
      );

      if (!canUseForm) {
        console.log(`Error: A servicepoint with this systemId cannot use form ${queryParams.formId}`);
        return {
          props: {
            lngDict,
          },
        };
      }

      const externalServicepointResp = await fetch(
        `${API_URL_BASE}${API_FETCH_EXTERNAL_SERVICEPOINTS}?format=json&external_servicepoint_id=${queryParams.targetId}`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const externalServicepointData = await (externalServicepointResp.json() as Promise<ExternalServicepoint[]>);

      let servicepointId = 0;
      let entranceId = 0;
      if (externalServicepointData && externalServicepointData.length > 0) {
        servicepointId = externalServicepointData[0].servicepoint;
      }

      const servicepointResp = await fetch(`${API_URL_BASE}${API_FETCH_SERVICEPOINTS}?format=json&servicepoint_id=${servicepointId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointData = await (servicepointResp.json() as Promise<Servicepoint[]>);

      const isNewServicepoint = servicepointData.length === 0;
      const date = getCurrentDate();

      if (isNewServicepoint) {
        // Create a new servicepoint
        servicepointId = await createServicePoint(
          queryParams.systemId,
          queryParams.name,
          queryParams.targetId,
          queryParams.user,
          API_URL_BASE,
          queryParams.locationId
        );

        // Create a new empty entrance
        // Form id is usually 2 here, meaning meeting room
        entranceId = await createEntrance(servicepointId, Number(queryParams.formId), queryParams.user, API_URL_BASE);

        console.log("New servicepoint and entrance inserted to the database");
      } else {
        // Existing servicepoint
        servicepointId = servicepointData[0].servicepoint_id;

        // There could be multiple external servicepoint ids for each servicepoint, so update the
        // servicepoint table with this request's id as a way to record which one was last accessed
        const servicepointRequestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            servicepoint_name: queryParams.name,
            ext_servicepoint_id: queryParams.targetId,
            modified: date,
            modified_by: queryParams.user,
            // is_searchable: "Y",
          }),
        };

        console.log("Update existing servicepoint");
        const existingServicepointResp = await fetch(
          `${API_URL_BASE}${API_FETCH_SERVICEPOINTS}${servicepointId}/update_external/`,
          servicepointRequestOptions
        );
        await (existingServicepointResp.json() as Promise<Servicepoint>);

        const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${servicepointId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceResults = await (entranceResp.json() as Promise<EntranceResults>);

        if (entranceResults && entranceResults.results && entranceResults.results.length > 0) {
          const mainEntrance = entranceResults.results.find((entrance) => entrance.is_main_entrance === "Y");
          if (mainEntrance) {
            entranceId = mainEntrance.entrance_id;
          }
        }
      }

      return {
        props: {
          lngDict,
          servicepointId,
          entranceId,
          user: queryParams.user,
          skip: true,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }
  return {
    props: {
      lngDict,
      user: query.user,
      skip: false,
    },
  };
};

export default Target;
