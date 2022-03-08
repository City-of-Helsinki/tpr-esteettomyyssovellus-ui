import React, { ChangeEvent, ReactElement, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
// import { getPreciseDistance } from "geolib";
import { Button, RadioButton, SelectionGroup } from "hds-react";
import Layout from "../components/common/Layout";
import i18nLoader from "../utils/i18n";
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
import { useAppDispatch } from "../state/hooks";
import styles from "./ServicePoint.module.scss";
import getOrigin from "../utils/request";
import { getCurrentDate, getTokenHash, validateChecksum } from "../utils/utilFunctions";
import { checksumSecretTPRTesti } from "../utils/checksumSecret";
import { Servicepoint, System, SystemForm } from "../types/backendModels";
import { setUser } from "../state/reducers/generalSlice";

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
  user,
  skip,
}: ChangeProps): ReactElement => {
  const i18n = useI18n();
  const startState = "0";
  const [selectedRadioItem, setSelectedRadioItem] = useState(startState);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (user != undefined) {
    dispatch(setUser(user));
  }

  if (skip) {
    router.push("/details/" + servicepointId);
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
          modified: getCurrentDate(),
          modified_by: user,
        }),
      };
      const updateAddressUrl = `${getOrigin(router)}/${API_FETCH_SERVICEPOINTS}${servicepointId}/update_address/`;
      //const updateAddressUrl = `${API_URL_BASE}${API_FETCH_SERVICEPOINTS}${servicepointId}/update_address/`;

      await fetch(updateAddressUrl, updateAddressOptions);
      const url = `/details/${servicepointId}`;
      router.push(url);
      // TODO: Update entry in ArServicePoint and redirect to /details/x page.
    }
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        {changed && changed === "address" && (
          <div>
            <h1>
              {i18n.t("AddressChangedPage.headerSentence1")}
              {servicepointName}
              {i18n.t("AddressChangedPage.headerSentence2")}
            </h1>
            <div className={styles.addressBlock}>
              <p>{i18n.t("AddressChangedPage.oldAddress")}:</p>
              <h4 className={styles.address}>{`${oldAddress} ${oldAddressNumber}, ${oldAddressCity}`}</h4>
            </div>
            <div className={styles.addressBlock}>
              <p>{i18n.t("AddressChangedPage.oldAddress")}:</p>
              <h4 className={styles.address}>{`${newAddress} ${newAddressNumber}, ${newAddressCity}`}</h4>
            </div>
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

        {changed && changed !== "address" && <h1>{i18n.t("AddressChangedPage.locationHasChanged")}</h1>}

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
      query?.systemId === undefined ||
      query?.servicePointId === undefined ||
      query?.user === undefined ||
      query?.validUntil === undefined ||
      query?.name === undefined ||
      query?.streetAddress === undefined ||
      query?.postOffice === undefined ||
      query?.northing === undefined ||
      query?.easting === undefined ||
      query?.checksum === undefined
    ) {
      return {
        props: {
          lngDict,
        },
      };
    }
    try {
      let servicepointId = 0;
      const systemResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEMS}${query.systemId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointResp = await fetch(`${API_URL_BASE}${API_FETCH_SERVICEPOINTS}?format=json&ext_servicepoint_id=${query.servicePointId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemData = await (systemResp.json() as Promise<System[]>);
      const servicepointData = await (servicepointResp.json() as Promise<Servicepoint[]>);

      const checksumSecret = systemData && systemData.length > 0 ? systemData[0].checksum_secret : undefined;
      const checksum = process.env.NODE_ENV === "production" ? checksumSecret ?? "" : checksumSecretTPRTesti;
      const checksumString =
        checksum +
        query.systemId +
        query.servicePointId +
        query.user +
        query.validUntil +
        query.streetAddress +
        query.postOffice +
        query.name +
        query.northing +
        query.easting;

      const checksumIsValid = validateChecksum(checksumString, query.checksum);

      // TODO: UNCOMMENT WHEN MOVING TO PRODUCTION / TESTING
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

      const canUseForm = systemFormData.some((system: SystemForm) => system.system === query.systemId && (system.form === 0 || system.form === 1));

      if (!canUseForm) {
        throw new Error("A servicepoint with this systemId cannot use form 0 or 1");
      }

      // CHOP THE ADDRESS
      const addressRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          address: query.streetAddress,
          postOffice: query.postOffice,
        }),
      };
      const addressResponse = await fetch(`${API_URL_BASE}${API_CHOP_ADDRESS}`, addressRequestOptions);
      const addressData = await (addressResponse.json() as Promise<string[]>);
      const [choppedAddress = "", choppedAddressNumber = "", choppedPostOffice = ""] = addressData || [];

      const isNewServicepoint = servicepointData.length === 0;

      if (isNewServicepoint) {
        // TODO: ADD NEW ENTRY TO ARSERVICEPOINTS
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
            servicepoint_name: query.name,
            ext_servicepoint_id: query.servicePointId,
            created: date,
            created_by: query.user,
            modified: date,
            modified_by: query.user,
            address_street_name: choppedAddress,
            address_no: choppedAddressNumber,
            address_city: choppedPostOffice,
            // accessibility_phone: null, // Set in accessibilityEdit
            // accessibility_email: null, // Set in accessibilityEdit
            // accessibility_www: null, // Set in accessibilityEdit
            is_searchable: "Y", // TODO: Y or N?
            organisation_id: query.systemId,
            loc_easting: query.easting,
            loc_northing: query.northing,
            location_id: null, // NULL according to mail
            system: query.systemId,
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
            external_servicepoint_id: query.servicePointId,
            created: date,
            created_by: query.user,
            system: query.systemId,
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
            loc_easting: query.easting,
            loc_northing: query.northing,
            photo_url: null,
            streetview_url: null,
            created: date,
            created_by: query.user,
            modified: date,
            modified_by: query.user,
            is_main_entrance: "Y",
            servicepoint: servicepointId,
            // TODO: HOW IS THIS DETERMINED? POSSIBLY 0 DUE TO THE FACT THAT THIS IS
            // THE MAIN ENTRANCE?
            form: 0,
          }),
        };

        await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}`, entranceRequestOptions);
        console.log("Create new entrance");

        console.log("New servicepoint and entrance inserted to the database");
      } else {
        // TODO: COMPARE EXISTING VALUES
        console.log("Compare old data");
        servicepointId = servicepointData[0].servicepoint_id;
        const oldAddress = servicepointData[0].address_street_name;
        const oldAddressNumber = servicepointData[0].address_no;
        const oldAddressCity = servicepointData[0].address_city;
        // const oldEasting = servicepointData[0].loc_easting;
        // const oldNorthing = servicepointData[0].loc_northing;
        const newAddress = choppedAddress;
        const newAddressNumber = choppedAddressNumber;
        const newAddressCity = choppedPostOffice;
        const servicepointName = query.name;

        const addressHasChanged = oldAddress !== choppedAddress || oldAddressNumber !== choppedAddressNumber || oldAddressCity !== choppedPostOffice;

        /*
        const preciseDistance = getPreciseDistance(
          { latitude: oldNorthing, longitude: oldEasting },
          {
            latitude: Number(query.northing),
            longitude: Number(query.easting),
          }
        );
        */

        // console.log(oldNorthing, oldEasting);
        // console.log(Number(query.northing), Number(query.easting));
        // console.log(preciseDistance);
        // const locationHasChanged = preciseDistance > 15;

        if (addressHasChanged) {
          const changed = "address";
          return {
            props: {
              lngDict,
              changed,
              servicepointId,
              servicepointName,
              oldAddress,
              oldAddressNumber,
              oldAddressCity,
              newAddress,
              newAddressNumber,
              newAddressCity,
              user: query.user,
              skip: false,
            },
          };
        }
        // if (locationHasChanged) {
        //   let changed = "location";
        //   return {
        //     props: {
        //       lngDict,
        //       changed,
        //       servicepointId
        //     }
        //   };
        // }
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
          user: query.user,
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
