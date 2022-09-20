import React, { ChangeEvent, ReactElement, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Button, RadioButton, SelectionGroup } from "hds-react";
import Layout from "../components/common/Layout";
import { useAppDispatch } from "../state/hooks";
import { setUser } from "../state/reducers/generalSlice";
import { ExternalServicepoint, Servicepoint, System, SystemForm } from "../types/backendModels";
import {
  API_CHOP_ADDRESS,
  API_FETCH_ENTRANCES,
  API_FETCH_SERVICEPOINTS,
  API_FETCH_SYSTEMS,
  API_FETCH_SYSTEM_FORMS,
  API_FETCH_EXTERNAL_SERVICEPOINTS,
  API_URL_BASE,
} from "../types/constants";
import { ChangeProps } from "../types/general";
import { checksumSecretTPRTesti } from "../utils/checksumSecret";
import i18nLoader from "../utils/i18n";
import getOrigin from "../utils/request";
import { formatAddress, getCurrentDate, getTokenHash, validateChecksum } from "../utils/utilFunctions";
import styles from "./ServicePoint.module.scss";

const Servicepoints = ({
  changed,
  servicepointId,
  servicepointName,
  newAddress,
  oldAddress,
  newAddressNumber,
  oldAddressNumber,
  newAddressCity,
  oldAddressCity,
  newEasting,
  newNorthing,
  distance,
  user,
  skip,
}: ChangeProps): ReactElement => {
  const i18n = useI18n();
  const startState = "0";
  const [selectedRadioItem, setSelectedRadioItem] = useState(startState);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (user !== undefined) {
    dispatch(setUser(user));
  }

  const setSearchable = async () => {
    const setSearchableOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getTokenHash(),
      },
    };
    const updateAddressUrl = `${getOrigin(router)}/${API_FETCH_SERVICEPOINTS}${servicepointId}/set_searchable/`;
    await fetch(updateAddressUrl, setSearchableOptions);
  };
  setSearchable();

  if (skip) {
    router.push(`/details/${servicepointId}`);
  }

  const handleRadioClick = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioItem(e.target.value);
  };

  const handleContinueClick = async () => {
    if (selectedRadioItem === "1") {
      console.log("Yes selected");

      // TODO: (Remove entry from ArServicePoint)? and create a new entry.
    } else if (selectedRadioItem === "2") {
      console.log("No selected");
      const updateAddressOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getTokenHash(),
        },
        body: JSON.stringify({
          address_street_name: newAddress,
          address_no: newAddressNumber,
          address_city: newAddressCity,
          loc_easting: newEasting,
          loc_northing: newNorthing,
          modified: getCurrentDate(),
          modified_by: user,
        }),
      };
      const updateAddressUrl = `${getOrigin(router)}/${API_FETCH_SERVICEPOINTS}${servicepointId}/update_address/`;
      await fetch(updateAddressUrl, updateAddressOptions);

      router.push(`/details/${servicepointId}`);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content">
        {changed && (
          <div>
            <h1>
              {i18n.t("AddressChangedPage.headerSentence1")}
              {servicepointName}
              {i18n.t("AddressChangedPage.headerSentence2")}
            </h1>

            {changed === "address" && (
              <>
                <div className={styles.addressBlock}>
                  <p>{i18n.t("AddressChangedPage.oldAddress")}:</p>
                  <p className={styles.address}>{formatAddress(oldAddress, oldAddressNumber, oldAddressCity)}</p>
                </div>
                <div className={styles.addressBlock}>
                  <p>{i18n.t("AddressChangedPage.newAddress")}:</p>
                  <p className={styles.address}>{formatAddress(newAddress, newAddressNumber, newAddressCity)}</p>
                </div>
              </>
            )}

            {changed === "location" && (
              <div className={styles.addressBlock}>
                <p>{i18n.t("AddressChangedPage.locationHasChanged1")}</p>
                <p className={styles.address}>{Math.round(distance ?? 0)}</p>
                <p>{i18n.t("AddressChangedPage.locationHasChanged2")}</p>
              </div>
            )}

            <div className={styles.radioButtonDiv}>
              <SelectionGroup label={i18n.t("AddressChangedPage.hasServicepointMoved")}>
                <RadioButton
                  id="v-radio1"
                  name="v-radio"
                  label={i18n.t("AddressChangedPage.radioButtonYes")}
                  value="1"
                  checked={selectedRadioItem === "1"}
                  onChange={handleRadioClick}
                />
                <RadioButton
                  id="v-radio2"
                  name="v-radio"
                  label={i18n.t("AddressChangedPage.radioButtonNo")}
                  value="2"
                  checked={selectedRadioItem === "2"}
                  onChange={handleRadioClick}
                />
              </SelectionGroup>
            </div>
            <Button id="continueButton" variant="primary" disabled={selectedRadioItem === startState} onClick={handleContinueClick}>
              {i18n.t("accessibilityForm.continue")}
            </Button>
            {
              // TODO: Sulje välilehti
            }
          </div>
        )}

        {!changed && <h1>{i18n.t("AddressChangedPage.errorHasOccured")}</h1>}
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ locales, query }) => {
  const lngDict = await i18nLoader(locales);

  // systemId=e186251e-1fb6-4f21-901c-cb6820aee164     DONE
  // &servicePointId=3266
  // &user=uusiesteettomyys%40hel.fi
  // &validUntil=2021-07-08T11%3a34%3a16
  // &name=Kallion+kirjasto
  // &streetAddress=Kuudes+linja+11
  // &postOffice=Helsinki
  // &northing=6673631
  // &easting=386500
  // &checksum=90CE983598EB80B3A7332B700C0CA5E8C4FF3E6689CA4FB5C2000BCB578843C6

  if (query !== undefined) {
    if (
      query.systemId === undefined ||
      query.servicePointId === undefined ||
      query.user === undefined ||
      query.validUntil === undefined ||
      query.name === undefined ||
      query.streetAddress === undefined ||
      query.postOffice === undefined ||
      query.northing === undefined ||
      query.easting === undefined ||
      query.checksum === undefined
    ) {
      return {
        props: {
          lngDict,
        },
      };
    }

    try {
      const queryParams = {
        systemId: query.systemId,
        servicePointId: query.servicePointId,
        user: query.user,
        validUntil: query.validUntil,
        name: query.name,
        streetAddress: query.streetAddress,
        postOffice: query.postOffice,
        northing: query.northing,
        easting: query.easting,
        checksum: query.checksum,
      };

      const systemResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEMS}?format=json&system_id=${queryParams.systemId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemData = await (systemResp.json() as Promise<System[]>);

      const checksumSecret = systemData && systemData.length > 0 ? systemData[0].checksum_secret : undefined;
      const checksum = process.env.NODE_ENV === "production" ? checksumSecret ?? "" : checksumSecretTPRTesti;
      const checksumString =
        checksum +
        queryParams.systemId +
        queryParams.servicePointId +
        queryParams.user +
        queryParams.validUntil +
        queryParams.streetAddress +
        queryParams.postOffice +
        queryParams.name +
        queryParams.northing +
        queryParams.easting;

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
        (system: SystemForm) => system.system === queryParams.systemId && (system.form === 0 || system.form === 1)
      );

      if (!canUseForm) {
        throw new Error("A servicepoint with this systemId cannot use form 0 or 1");
      }

      // CHOP THE ADDRESS
      const addressRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          address: queryParams.streetAddress,
          postOffice: queryParams.postOffice,
        }),
      };
      const addressResponse = await fetch(`${API_URL_BASE}${API_CHOP_ADDRESS}`, addressRequestOptions);
      const addressData = await (addressResponse.json() as Promise<string[]>);
      const [choppedAddress = "", choppedAddressNumber = "", choppedPostOffice = ""] = addressData || [];

      const externalServicepointResp = await fetch(
        `${API_URL_BASE}${API_FETCH_EXTERNAL_SERVICEPOINTS}?format=json&external_servicepoint_id=${queryParams.servicePointId}`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const externalServicepointData = await (externalServicepointResp.json() as Promise<ExternalServicepoint[]>);

      let servicepointId = 0;
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
            ext_servicepoint_id: queryParams.servicePointId,
            created: date,
            created_by: queryParams.user,
            modified: date,
            modified_by: queryParams.user,
            address_street_name: choppedAddress,
            address_no: choppedAddressNumber,
            address_city: choppedPostOffice,
            // accessibility_phone: null, // Set in accessibilityEdit
            // accessibility_email: null, // Set in accessibilityEdit
            // accessibility_www: null, // Set in accessibilityEdit
            is_searchable: "Y",
            organisation_id: queryParams.systemId,
            loc_easting: queryParams.easting,
            loc_northing: queryParams.northing,
            location_id: null, // NULL according to mail
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
            external_servicepoint_id: queryParams.servicePointId,
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
            loc_easting: queryParams.easting,
            loc_northing: queryParams.northing,
            photo_url: null,
            streetview_url: null,
            created: date,
            created_by: queryParams.user,
            modified: date,
            modified_by: queryParams.user,
            is_main_entrance: "Y",
            servicepoint: servicepointId,
            form: 0, // Main entrance
          }),
        };

        await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}`, entranceRequestOptions);
        console.log("Created new entrance");

        console.log("New servicepoint and entrance inserted to the database");
      } else {
        // There could be multiple external servicepoint ids for each servicepoint, so update the
        // servicepoint table with this request's id as a way to record which one was last accessed
        const servicepointRequestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            servicepoint_name: queryParams.name,
            ext_servicepoint_id: queryParams.servicePointId,
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

        console.log("Compare old data");
        servicepointId = servicepointData[0].servicepoint_id;
        const oldAddress = servicepointData[0].address_street_name ?? "";
        const oldAddressNumber = servicepointData[0].address_no ?? "";
        const oldAddressCity = servicepointData[0].address_city ?? "";
        const oldEasting = servicepointData[0].loc_easting ?? 0;
        const oldNorthing = servicepointData[0].loc_northing ?? 0;
        const newAddress = choppedAddress;
        const newAddressNumber = choppedAddressNumber;
        const newAddressCity = choppedPostOffice;
        const newEasting = Number(queryParams.easting);
        const newNorthing = Number(queryParams.northing);
        const servicepointName = queryParams.name;

        // The chop address function does not necessarily return uppercase values
        const addressHasChanged =
          oldAddress.toUpperCase() !== choppedAddress.toUpperCase() ||
          oldAddressNumber.toUpperCase() !== choppedAddressNumber.toUpperCase() ||
          oldAddressCity.toUpperCase() !== choppedPostOffice.toUpperCase();

        const distance = Math.sqrt(Math.pow(oldNorthing - newNorthing, 2) + Math.pow(oldEasting - newEasting, 2));
        const locationHasChanged = distance > 15;

        if (addressHasChanged) {
          return {
            props: {
              lngDict,
              changed: "address",
              servicepointId,
              servicepointName,
              oldAddress,
              oldAddressNumber,
              oldAddressCity,
              newAddress,
              newAddressNumber,
              newAddressCity,
              newEasting,
              newNorthing,
              user: queryParams.user,
              skip: false,
            },
          };
        }
        if (locationHasChanged) {
          return {
            props: {
              lngDict,
              changed: "location",
              servicepointId,
              servicepointName,
              newAddress,
              newAddressNumber,
              newAddressCity,
              newEasting,
              newNorthing,
              distance,
              user: queryParams.user,
              skip: false,
            },
          };
        }
      }

      // Variables from database

      // TODO: Check the servicepointdata response whether there is an entry in the database,
      // for the servicepointId. If not create a new entry to the table based on the URL info.
      // If there is an old entry modify the data.

      // •    Jos (esteettömyyssovelluksen kannalta) uusi toimipiste =>
      // sovellus luo tietueen ar_servicepoint-tauluun (saatujen parametrien perusteella) ja
      //  pääsisäänkäynnin ar_entrance-tauluun (sijainniksi parametrina saadut northing ja easting).
      // o	Jos vanha toimipiste => päivitetään ar_servicepoint-taulun
      // tietuetta saatujen parametrien mukaan (esim. toimipisteen nimen päivitys).

      // TODO: Osoite- ja sijaintitarkistus: Myös on tarkistettava parametreissa saatu osoitetieto
      // (streetAddress, postOffice) ja koordinaatit (northing, easting).
      // Jos käyntiosoite on muuttunut tai sijainti on yli 15 metriä siitä,
      // mitä lähetettiin edellisellä kerralla (=verrataan taulun ar_servicepoint vastaaviin sarakkeisiin),
      // niin esitetään jompikumpi kysymys (ja voisi siinä olla myös painike ”Sulje välilehti”):
      // jolloin käyttäjä voi a) sulkea välilehden ja mikään ei muutu, b)
      // valita Kyllä + Jatka, jolloin vanhat tiedot menetetään ja
      // lähdetään nollatilanteesta, c) valita Ei + Jatka, jolloin
      // vanhat vastaukset säilyvät, mutta toimipisteen nimi,
      // osoite ja sijainti taulussa ar_servicepoint kuitenkin päivitetään.

      return {
        props: {
          servicepointId,
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

export default Servicepoints;
