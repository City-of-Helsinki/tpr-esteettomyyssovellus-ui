import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "../components/common/Layout";
import { useAppDispatch } from "../state/hooks";
import { setUser } from "../state/reducers/generalSlice";
import { Entrance, EntranceResults, ExternalServicepoint, Servicepoint, System, SystemForm } from "../types/backendModels";
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
import { getCurrentDate, getTokenHash, validateChecksum } from "../utils/utilFunctions";

const Target = ({ servicepointId, servicepointName, entranceId, user, skip }: TargetProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (user !== undefined) {
    dispatch(setUser(user));
  }

  // IS THE LANGUAGECODE A NUMBER OR A STRING???
  // console.log(languageCode);

  // TODO - update servicepoint name
  console.log("servicepointName", servicepointName);

  if (skip) {
    router.push(`/entranceAccessibility/${servicepointId}/${entranceId}`);
  }

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content">{!skip && <h1>{i18n.t("AddressChangedPage.errorHasOccured")}</h1>}</main>
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
        systemId: query.systemId,
        targetId: query.targetId,
        locationId: query.locationId,
        user: query.user,
        validUntil: query.validUntil,
        name: query.name,
        formId: query.formId,
        checksum: query.checksum,
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

      if (!checksumIsValid) {
        console.log("Checksums did not match.");
        return {
          props: {
            lngDict,
          },
        };
      }
      console.log("Checksums matched.");

      const systemFormResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEM_FORMS}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemFormData = await (systemFormResp.json() as Promise<SystemForm[]>);

      const canUseForm = systemFormData.some(
        (system: SystemForm) => system.system === queryParams.systemId && system.form === Number(queryParams.formId)
      );

      if (!canUseForm) {
        throw new Error(`A servicepoint with this systemId cannot use form ${queryParams.formId}`);
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

      if (isNewServicepoint) {
        const date = getCurrentDate();
        const servicepointRequestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            // TODO: figure out
            // - business_id
            // - organisation_code
            // - system_id_old
            // - ext_servicepoint_id
            // - created
            // - modified
            // - modified_by
            // - address_street_name (THESE CAN BE GENERATED USING DATABASE FUNCTION)
            // - address_no (THESE CAN BE GENERATED USING DATABASE FUNCTION)
            // - address_city (THESE CAN BE GENERATED USING DATABASE FUNCTION)
            business_id: null,
            organisation_code: null,
            system_id_old: null,
            servicepoint_name: queryParams.name,
            ext_servicepoint_id: queryParams.targetId,
            created: date,
            created_by: queryParams.user,
            modified: date,
            modified_by: queryParams.user,
            // address_street_name: choppedAddress,
            // address_no: choppedAddressNumber,
            // address_city: choppedPostOffice,
            // accessibility_phone: null, // Set in accessibilityEdit
            // accessibility_email: null, // Set in accessibilityEdit
            // accessibility_www: null, // Set in accessibilityEdit
            is_searchable: "Y",
            organisation_id: queryParams.systemId,
            // loc_easting: queryParams.easting,
            // loc_northing: queryParams.northing,
            location_id: queryParams.locationId || null,
            system: queryParams.systemId,
          }),
        };

        // POST TO ARSERVICEPOINT. RETURNS NEW SERVICEPOINTID USED FOR OTHER POST REQUESTS
        console.log("Create new servicepoint");
        const newServicepointResp = await fetch(`${API_URL_BASE}${API_FETCH_SERVICEPOINTS}`, servicepointRequestOptions);
        const newServicepointData = await (newServicepointResp.json() as Promise<Servicepoint>);
        servicepointId = newServicepointData.servicepoint_id;

        const externalServicepointOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            external_servicepoint_id: queryParams.targetId,
            created: date,
            created_by: queryParams.user,
            system: queryParams.systemId,
            servicepoint: servicepointId,
          }),
        };

        await fetch(`${API_URL_BASE}${API_FETCH_EXTERNAL_SERVICEPOINTS}`, externalServicepointOptions);
        console.log("Created new external servicepoint");

        const entranceRequestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            name_fi: "",
            name_sv: null,
            name_en: null,
            loc_easting: null,
            loc_northing: null,
            photo_url: null,
            streetview_url: null,
            created: date,
            created_by: queryParams.user,
            modified: date,
            modified_by: queryParams.user,
            is_main_entrance: "Y",
            servicepoint: servicepointId,
            form: queryParams.formId,
          }),
        };

        const newEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}`, entranceRequestOptions);
        const newEntranceData = await (newEntranceResp.json() as Promise<Entrance>);
        entranceId = newEntranceData.entrance_id;
        console.log("Created new entrance");

        console.log("New servicepoint and entrance inserted to the database");
      } else {
        // Existing servicepoint
        servicepointId = servicepointData[0].servicepoint_id;

        const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${servicepointId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceResults = await (entranceResp.json() as Promise<EntranceResults>);

        if (entranceResults && entranceResults.results && entranceResults.results.length > 0) {
          entranceId = entranceResults.results[0].entrance_id;
        }
      }

      return {
        props: {
          lngDict,
          servicepointId,
          servicepointName: queryParams.name,
          entranceId: entranceId,
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
