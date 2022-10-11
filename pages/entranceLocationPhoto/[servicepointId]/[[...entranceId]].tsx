import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import Layout from "../../../components/common/Layout";
import LoadSpinner from "../../../components/common/LoadSpinner";
import PageHelp from "../../../components/common/PageHelp";
import SkipMapButton from "../../../components/common/SkipMapButton";
import ValidationSummary from "../../../components/common/ValidationSummary";
import EntranceLocation from "../../../components/EntranceLocation";
import EntranceLocationPhotoCtrlButtons from "../../../components/EntranceLocationPhotoCtrlButtons";
import EntrancePhoto from "../../../components/EntrancePhoto";
import { useAppSelector, useLoading } from "../../../state/hooks";
import { formatAddress, getTokenHash } from "../../../utils/utilFunctions";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_URL_BASE,
} from "../../../types/constants";
import { BackendEntrance, BackendFormGuide, BackendServicepoint, Entrance, EntranceResults } from "../../../types/backendModels";
import { EntranceLocationPhotoProps } from "../../../types/general";
import i18nLoader from "../../../utils/i18n";
import styles from "./entranceLocationPhoto.module.scss";

// usage: the location and/or photo of an entrance
const EntranceBlockLocationPhoto = ({ servicepointData, entranceData, formGuideData, formId }: EntranceLocationPhotoProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const isLoading = useLoading();

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  // NOTE: don't clear the state in this page, since any new data should be used after returning to the question form
  /*
  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);
  */

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curEntranceLocationPhoto = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhoto);
  const curEntranceLocationPhotoValid = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhotoValid);
  const entranceLocationPhotoValidationTime = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhotoValidationTime);

  const { invalidValues, canAddLocation, canAddPhoto } = curEntranceLocationPhoto;

  const hasData = Object.keys(servicepointData).length > 0 && curServicepointId === servicepointData.servicepoint_id;
  const isExistingEntrance = hasData && Object.keys(entranceData).length > 0;

  // Note: There is no sub-header for meeting rooms (form id 2)
  const entranceName = entranceData ? entranceData[`name_${curLocale}`] : "";
  const entranceHeader =
    formId === 0
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName}`;
  const newEntranceHeader = formId === 0 ? i18n.t("common.mainEntrance") : i18n.t("common.newEntrance");
  const servicePointHeader = isExistingEntrance ? entranceHeader : newEntranceHeader;
  const subHeader = formId >= 2 ? "" : servicePointHeader;

  const treeItems = {
    [servicepointData.servicepoint_name ?? ""]: hasData ? `/details/${servicepointData.servicepoint_id}` : "",
    [i18n.t("servicepoint.contactFormSummaryHeader")]:
      curEntranceId > 0 ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}` : `/entranceAccessibility/${curServicepointId}`,
    [i18n.t("additionalInfo.additionalInfo")]:
      curEntranceId > 0 ? `/entranceLocationPhoto/${curServicepointId}/${curEntranceId}` : `/entranceLocationPhoto/${curServicepointId}`,
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      {!isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isUserValid && isLoading && <LoadSpinner />}

      {isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.infocontainer}>
              <PageHelp formGuideData={formGuideData} treeItems={treeItems} />
            </div>

            <div className={styles.headingcontainer}>
              <h1>{servicepointData.servicepoint_name}</h1>
              <div className={styles.subHeader}>{subHeader}</div>

              <div className={styles.mainbuttons}>
                <EntranceLocationPhotoCtrlButtons entranceLocationPhoto={curEntranceLocationPhoto} />
                {!curEntranceLocationPhotoValid && (
                  <ValidationSummary
                    pageValid={curEntranceLocationPhotoValid}
                    validationSummary={invalidValues}
                    validationTime={entranceLocationPhotoValidationTime}
                  />
                )}
              </div>

              <div className={styles.infoHeader}>{i18n.t("additionalInfo.additionalInfo")}</div>
            </div>

            <div className={styles.contentcontainer}>
              {canAddPhoto && (
                <div>
                  <div className={styles.contentheader}>{i18n.t("additionalInfo.pictureTitle")}</div>
                  <EntrancePhoto entranceLocationPhoto={curEntranceLocationPhoto} />
                </div>
              )}

              {canAddLocation && (
                <div>
                  <div className={styles.contentheader}>{i18n.t("additionalInfo.locationTitle")}</div>
                  <SkipMapButton idToSkipTo="#locationinputcontainer" />
                  <EntranceLocation entranceLocationPhoto={curEntranceLocationPhoto} />
                </div>
              )}
            </div>

            <div className={styles.footercontainer}>
              <div className={styles.footerbutton}>
                <EntranceLocationPhotoCtrlButtons entranceLocationPhoto={curEntranceLocationPhoto} />
              </div>
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  let entranceData: BackendEntrance = {} as BackendEntrance;
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let formGuideData: BackendFormGuide[] = [];
  let formId = -1;

  if (params !== undefined) {
    try {
      const servicepointBackendDetailResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_SERVICEPOINT}?servicepoint_id=${params.servicepointId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointBackendDetail = await (servicepointBackendDetailResp.json() as Promise<BackendServicepoint[]>);

      if (servicepointBackendDetail?.length > 0) {
        servicepointData = servicepointBackendDetail[0];
      }

      // Get all the existing entrances for the service point
      const servicepointEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${params.servicepointId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointEntranceResults = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      const mainEntrance = servicepointEntranceResults?.results?.find((result) => result.is_main_entrance === "Y");
      let isMainEntrancePublished = false;
      if (!!mainEntrance) {
        // The main entrance exists, but check if it's published
        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${mainEntrance.entrance_id}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        isMainEntrancePublished = entranceDetail.some((e) => e.form_submitted === "Y");
      } else {
        isMainEntrancePublished = false;
      }

      // Check this specific entrance
      if (params.entranceId === undefined && (servicepointData.servicepoint_id === undefined || servicepointData.new_entrance_possible === "Y")) {
        // New entrance
        // This is a new main entrance if not existing, otherwise an additional entrance
        formId = !isMainEntrancePublished || !mainEntrance || servicepointData.servicepoint_id === undefined ? 0 : 1;
      } else if (params.entranceId !== undefined) {
        // Existing entrance
        const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}${params.entranceId}/?format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entrance = await (entranceResp.json() as Promise<Entrance>);

        // Use the form id from the entrance if available
        formId = entrance ? entrance.form : -1;

        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        if (entranceDetail.length > 0) {
          // Return entrance data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          const maxLogId =
            entranceDetail.sort((a: BackendEntrance, b: BackendEntrance) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          entranceData = entranceDetail.find((a) => a.log_id === maxLogId) as BackendEntrance;

          // In some cases there is no published entrance, so form_submitted and log_id are null
          if (!entranceData) {
            entranceData = entranceDetail[0];
          }
        }
      }

      // Get the guide text using the form id for this entrance
      if (formId >= 0) {
        const formGuideResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_FORM_GUIDE}?form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        formGuideData = await (formGuideResp.json() as Promise<BackendFormGuide[]>);
      }
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as BackendServicepoint;
      entranceData = {} as BackendEntrance;
      formGuideData = [];
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
      formGuideData,
      formId,
    },
  };
};

export default EntranceBlockLocationPhoto;
