import React, { ChangeEvent, ReactElement, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Button, RadioButton, SelectionGroup } from "hds-react";
import Layout from "../components/common/Layout";
import LoadSpinner from "../components/common/LoadSpinner";
import ModalConfirmation from "../components/common/ModalConfirmation";
import { useAppDispatch } from "../state/hooks";
import { setChecksum, setUser } from "../state/reducers/generalSlice";
import { EntranceResults, ExternalServicepoint, Servicepoint, System, SystemForm } from "../types/backendModels";
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
// import { checksumSecretTPRTesti } from "../utils/checksumSecret";
import i18nLoader from "../utils/i18n";
import getOrigin from "../utils/request";
import { createEntrance, createServicePoint, getServicepointHash } from "../utils/serverside";
import { deleteEntrance, formatAddress, getCurrentDate, getTokenHash, validateChecksum, validateDate } from "../utils/utilFunctions";
import styles from "./ServicePoint.module.scss";

const Servicepoints = ({
  changed,
  servicepointId,
  servicepointName,
  entranceId,
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
  checksum,
  skip,
}: ChangeProps): ReactElement => {
  const i18n = useI18n();
  const startState = "0";
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [selectedRadioItem, setSelectedRadioItem] = useState(startState);
  const [confirmDeletion, setConfirmDeletion] = useState(false);

  if (user !== undefined) {
    dispatch(setUser(user));
  }
  if (checksum !== undefined) {
    dispatch(setChecksum(checksum));
  }

  if (skip) {
    router.push(`/details/${servicepointId}?checksum=${checksum}`);
  }

  const handleRadioClick = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioItem(e.target.value);
  };

  const handleContinueClick = async () => {
    if (selectedRadioItem === "1" && entranceId !== undefined) {
      // Delete the main entrance data and create a new empty one
      // Form id 0 means main entrance
      await deleteEntrance(entranceId, router);
      await createEntrance(servicepointId as number, 0, user as string, `${getOrigin(router)}/`, newEasting as number, newNorthing as number);
    }

    // Update the address and coordinates for both options
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

    router.push(`/details/${servicepointId}?checksum=${checksum}`);
  };

  const openDeletionConfirmation = () => {
    if (selectedRadioItem === "1") {
      setConfirmDeletion(true);
    } else {
      handleContinueClick();
    }
  };

  const closeDeletionConfirmation = () => {
    setConfirmDeletion(false);
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
                  id="v-radio2"
                  name="v-radio"
                  label={i18n.t("AddressChangedPage.radioButtonNo")}
                  value="2"
                  checked={selectedRadioItem === "2"}
                  onChange={handleRadioClick}
                />
                <RadioButton
                  id="v-radio1"
                  name="v-radio"
                  label={i18n.t("AddressChangedPage.radioButtonYes")}
                  value="1"
                  checked={selectedRadioItem === "1"}
                  onChange={handleRadioClick}
                />
              </SelectionGroup>
            </div>
            <Button id="continueButton" variant="primary" disabled={selectedRadioItem === startState} onClick={openDeletionConfirmation}>
              {i18n.t("accessibilityForm.continue")}
            </Button>

            {confirmDeletion && (
              <ModalConfirmation
                open={confirmDeletion}
                titleKey="servicepoint.buttons.deleteAccessibilityInfo"
                messageKey="servicepoint.confirmation.deleteAccessibilityInfo"
                cancelKey="common.buttons.no"
                confirmKey="common.buttons.yes"
                closeCallback={closeDeletionConfirmation}
                confirmCallback={handleContinueClick}
              />
            )}
          </div>
        )}

        {!skip && !changed && <h1>{i18n.t("AddressChangedPage.errorHasOccured")}</h1>}

        {skip && !changed && <LoadSpinner />}
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
        systemId: query.systemId as string,
        servicePointId: query.servicePointId as string,
        user: query.user as string,
        validUntil: query.validUntil as string,
        name: query.name as string,
        streetAddress: query.streetAddress as string,
        postOffice: query.postOffice as string,
        northing: query.northing as string,
        easting: query.easting as string,
        checksum: query.checksum as string,
      };

      const systemResp = await fetch(`${API_URL_BASE}${API_FETCH_SYSTEMS}?format=json&system_id=${queryParams.systemId}`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const systemData = await (systemResp.json() as Promise<System[]>);

      const checksumSecret = systemData && systemData.length > 0 ? systemData[0].checksum_secret : undefined;
      // const checksum = process.env.NODE_ENV === "production" ? checksumSecret ?? "" : checksumSecretTPRTesti;
      const checksum = checksumSecret ?? "";
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
        (system: SystemForm) => system.system === queryParams.systemId && (system.form === 0 || system.form === 1)
      );

      if (!canUseForm) {
        console.log("Error: A servicepoint with this systemId cannot use form 0 or 1");
        return {
          props: {
            lngDict,
          },
        };
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
      let entranceId = 0;
      let servicepointChecksum = "";
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
          queryParams.servicePointId,
          queryParams.user,
          API_URL_BASE,
          undefined, // Location id
          choppedAddress,
          choppedAddressNumber,
          choppedPostOffice,
          Number(queryParams.easting),
          Number(queryParams.northing)
        );

        // Create a new empty entrance
        // Form id 0 means main entrance
        entranceId = await createEntrance(
          servicepointId,
          0,
          queryParams.user,
          API_URL_BASE,
          Number(queryParams.easting),
          Number(queryParams.northing)
        );

        servicepointChecksum = getServicepointHash(servicepointId);

        console.log("New servicepoint and entrance inserted to the database");
      } else {
        // There could be multiple external servicepoint ids for each servicepoint, so update the
        // servicepoint table with this request's id as a way to record which one was last accessed
        // Note: update_external also sets is_searchable to 'Y'
        const servicepointRequestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            servicepoint_name: queryParams.name,
            ext_servicepoint_id: queryParams.servicePointId,
            modified: date,
            modified_by: queryParams.user,
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

        servicepointChecksum = getServicepointHash(servicepointId);

        if (addressHasChanged) {
          return {
            props: {
              lngDict,
              changed: "address",
              servicepointId,
              servicepointName,
              entranceId,
              oldAddress,
              oldAddressNumber,
              oldAddressCity,
              newAddress,
              newAddressNumber,
              newAddressCity,
              newEasting,
              newNorthing,
              user: queryParams.user,
              checksum: servicepointChecksum,
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
              entranceId,
              newAddress,
              newAddressNumber,
              newAddressCity,
              newEasting,
              newNorthing,
              distance,
              user: queryParams.user,
              checksum: servicepointChecksum,
              skip: false,
            },
          };
        }
      }

      // No changes
      return {
        props: {
          servicepointId,
          user: queryParams.user,
          checksum: servicepointChecksum,
          skip: true,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  // An error occurred
  return {
    props: {
      lngDict,
      user: query.user,
      skip: false,
    },
  };
};

export default Servicepoints;
