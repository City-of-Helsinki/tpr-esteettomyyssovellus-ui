import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../../components/common/Layout";
import ValidationSummary from "../../../components/common/ValidationSummary";
import QuestionInfo from "../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../../components/PathTreeComponent";
import EntranceLocation from "../../../components/EntranceLocation";
import EntranceLocationPhotoCtrlButtons from "../../../components/EntranceLocationPhotoCtrlButtons";
import EntrancePhoto from "../../../components/EntrancePhoto";
import LoadSpinner from "../../../components/common/LoadSpinner";
import { useAppSelector, useLoading } from "../../../state/hooks";
import { formatAddress, getTokenHash } from "../../../utils/utilFunctions";
import { API_FETCH_BACKEND_ENTRANCE, API_FETCH_BACKEND_SERVICEPOINT, API_URL_BASE } from "../../../types/constants";
import { BackendEntrance, BackendServicepoint } from "../../../types/backendModels";
import { EntranceLocationPhotoProps } from "../../../types/general";
import i18nLoader from "../../../utils/i18n";
import styles from "./entranceLocationPhoto.module.scss";

// usage: the location and/or photo of an entrance
const EntranceBlockLocationPhoto = ({ servicepointData, entranceData }: EntranceLocationPhotoProps): ReactElement => {
  const i18n = useI18n();
  const isLoading = useLoading();

  const treeItems = [servicepointData.servicepoint_name ?? ""];

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

  const { invalidValues, canAddLocation, canAddPhoto } = curEntranceLocationPhoto;

  const hasData =
    Object.keys(servicepointData).length > 0 &&
    curServicepointId === servicepointData.servicepoint_id &&
    Object.keys(entranceData).length > 0 &&
    curEntranceId === entranceData.entrance_id;

  const subHeader = `${i18n.t("common.mainEntrance")}: ${formatAddress(
    servicepointData.address_street_name,
    servicepointData.address_no,
    servicepointData.address_city
  )}`;

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      {!isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isUserValid && isLoading && <LoadSpinner />}

      {isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.treecontainer}>
              <PathTreeComponent treeItems={treeItems} />
            </div>

            <div className={styles.infocontainer}>
              <QuestionInfo
                openText={i18n.t("common.generalMainInfoIsClose")}
                closeText={i18n.t("common.generalMainInfoIsOpen")}
                openIcon={<IconQuestionCircle />}
                closeIcon={<IconCrossCircle />}
                textOnBottom
              >
                <ServicepointMainInfoContent />
              </QuestionInfo>
            </div>

            <div className={styles.headingcontainer}>
              <h1>{servicepointData.servicepoint_name}</h1>
              <div className={styles.subHeader}>{subHeader}</div>

              <div className={styles.mainbuttons}>
                <EntranceLocationPhotoCtrlButtons entranceLocationPhoto={curEntranceLocationPhoto} />
                {!curEntranceLocationPhotoValid && <ValidationSummary pageValid={curEntranceLocationPhotoValid} validationSummary={invalidValues} />}
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
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as BackendServicepoint;
      entranceData = {} as BackendEntrance;
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
    },
  };
};

export default EntranceBlockLocationPhoto;
