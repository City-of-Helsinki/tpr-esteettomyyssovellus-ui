import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import i18nLoader from "../utils/i18n";
import { useRouter } from "next/router";
import {
  API_URL_BASE,
  backendApiBaseUrl,
  FRONT_URL_BASE
} from "../types/constants";

const Servicepoints = (): ReactElement => {
  const i18n = useI18n();

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        <h1>Sovelluksessa tapahtui virhe</h1>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales,
  query
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

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

  let SystemData;
  let ServicepointData;
  if (query != undefined) {
    if (
      query?.systemId == undefined ||
      query?.servicePointId == undefined ||
      query?.user == undefined ||
      // query?.validUntil == undefined ||
      query?.name == undefined ||
      query?.streetAddress == undefined ||
      query?.postOffice == undefined ||
      query?.northing == undefined ||
      query?.easting == undefined ||
      query?.checksum == undefined
    ) {
      return {
        props: {
          initialReduxState,
          lngDict
        }
      };
    } else {
      try {
        let isNewServicepoint: boolean;
        let servicepointId: number = 0;
        const SystemResp = await fetch(
          `${backendApiBaseUrl}/ArSystems/?system_id=${query.systemId}&format=json`
        );
        const ServicepointResp = await fetch(
          `${backendApiBaseUrl}/ArServicepoints/?ext_servicepoint_id=${query.servicePointId}&format=json`
        );
        SystemData = await SystemResp.json();
        ServicepointData = await ServicepointResp.json();

        const systemName = SystemData[0]["name"];

        // TODO: MITÄ TÄLLÄ TEHDÄÄN???
        const checksumSecret = SystemData[0]["checksum_secret"];

        // LOMAKE 0 ja 1: systemName = "TPR" || "PTV"
        // LOMAKE 2: systemName = "HKI KOKOUSTILAT"
        if (!(systemName == "TPR" || systemName == "PTV")) {
          throw new Error(
            "A servicepoint with this systemId cannot use form 0 or 1"
          );
        }

        // console.log("ServicepointData", ServicepointData);
        isNewServicepoint = ServicepointData.length == 0;

        if (isNewServicepoint) {
          // TODO: ADD NEW ENTRY TO ARSERVICEPOINTS
          console.log("Create new servicepoint");
          let today = new Date();
          const date =
            today.getFullYear() +
            "-" +
            (today.getMonth() + 1) +
            "-" +
            today.getDate() +
            "T" +
            today.getHours() +
            ":" +
            today.getMinutes() +
            ":" +
            today.getSeconds() +
            "Z";

          const servicepointRequestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
              address_street_name: null,
              address_no: null,
              address_city: null,
              accessibility_phone: null, // Set in accessibilityEdit
              accessibility_email: null, // Set in accessibilityEdit
              accessibility_www: null, // Set in accessibilityEdit
              is_searchable: "Y", // TODO: Y or N?
              organisation_id: query.systemId,
              loc_easting: query.easting,
              loc_northing: query.northing,
              location_id: null, // NULL according to mail
              system: query.systemId
            })
          };

          // POST TO ARSERVICEPOINT. RETURNS NEW SERVICEPOINTID USED FOR OTHER POST REQUESTS
          await fetch(
            API_URL_BASE + "ArServicepoints/",
            servicepointRequestOptions
          )
            .then((response) => response.json())
            .then((data) => {
              servicepointId = data["servicepoint_id"];
            });

          const entranceRequestOption = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
              form: 0
            })
          };
          await fetch(API_URL_BASE + "ArEntrances/", entranceRequestOption)
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
            });
          console.log("New servicepoint and entrance inserted to the database");
        } else {
          // TODO: COMPARE EXISTING VALUES
          servicepointId = ServicepointData[0].servicepoint_id;
          console.log("Compare old data");
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
          redirect: {
            permanent: false,
            destination: FRONT_URL_BASE + "details/" + servicepointId
          }
        };

        //router.push(FRONT_URL_BASE + "details/" + params.servicePointId);
      } catch (err) {
        console.log(err);
      }
    }
  }
  return {
    props: {
      initialReduxState,
      lngDict
    }
  };
};

export default Servicepoints;
