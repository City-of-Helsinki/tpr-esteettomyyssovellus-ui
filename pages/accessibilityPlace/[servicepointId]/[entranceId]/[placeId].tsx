import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../../../components/common/Layout";
import ValidationSummary from "../../../../components/common/ValidationSummary";
import QuestionInfo from "../../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../../../components/PathTreeComponent";
import AccessibilityPlaceBox from "../../../../components/AccessibilityPlaceBox";
import AccessibilityPlaceCtrlButtons from "../../../../components/AccessibilityPlaceCtrlButtons";
import AccessibilityPlaceNewButton from "../../../../components/AccessibilityPlaceNewButton";
import LoadSpinner from "../../../../components/common/LoadSpinner";
import { useAppSelector, useLoading } from "../../../../state/hooks";
import { formatAddress, getTokenHash } from "../../../../utils/utilFunctions";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_URL_BASE,
  LanguageLocales,
} from "../../../../types/constants";
import { BackendEntrance, BackendPlace, BackendServicepoint } from "../../../../types/backendModels";
import { AccessibilityPlaceProps } from "../../../../types/general";
import i18nLoader from "../../../../utils/i18n";
import styles from "./accessibilityPlace.module.scss";

// usage: the accessibility place of a question
const AccessibilityPlace = ({ servicepointData, entranceData, accessibilityPlaceData }: AccessibilityPlaceProps): ReactElement => {
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
  const curEntrancePlaceBoxes = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceBoxes);
  const curEntrancePlaceValid = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceValid);

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

  const localeId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaceData = accessibilityPlaceData?.find((place) => place.language_id === localeId) ?? ({} as BackendPlace);

  // Show the boxes for this entrance place that have not been deleted
  const filteredEntrancePlaceBoxes = curEntrancePlaceBoxes
    ? curEntrancePlaceBoxes
        .filter((placeBox) => {
          return placeBox.place_id === filteredPlaceData.place_id && !placeBox.isDeleted;
        })
        .sort((a, b) => (a.order_number ?? 1) - (b.order_number ?? 1))
    : [];
  const filteredEntrancePlaceInvalidValues = filteredEntrancePlaceBoxes.flatMap((box) => box.invalidValues);

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
                <AccessibilityPlaceCtrlButtons placeId={filteredPlaceData.place_id} entrancePlaceBoxes={filteredEntrancePlaceBoxes} />
                {!curEntrancePlaceValid && (
                  <ValidationSummary pageValid={curEntrancePlaceValid} validationSummary={filteredEntrancePlaceInvalidValues} />
                )}
              </div>

              <div className={styles.infoHeader}>{`${i18n.t("additionalInfo.additionalInfo")} > ${filteredPlaceData.name}`}</div>
              <div className={styles.infoText}>
                <div>{`${i18n.t("additionalInfo.fillPlaceData1")} '${filteredPlaceData.name}' ${i18n.t("additionalInfo.fillPlaceData2")}`}</div>
                <div>{i18n.t("additionalInfo.orderPlaceData")}</div>
              </div>
            </div>

            <div>
              {filteredEntrancePlaceBoxes.map((entrancePlaceBox, index) => {
                const key = `box_${index}`;
                return <AccessibilityPlaceBox key={key} entrancePlaceBox={entrancePlaceBox} />;
              })}
            </div>

            <div className={styles.footerbutton}>
              <AccessibilityPlaceNewButton accessibilityPlaceData={filteredPlaceData} orderNumber={filteredEntrancePlaceBoxes.length + 1} />
            </div>
            <div className={styles.footerbutton}>
              <AccessibilityPlaceCtrlButtons placeId={filteredPlaceData.place_id} entrancePlaceBoxes={filteredEntrancePlaceBoxes} />
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
  let accessibilityPlaceData: BackendPlace[] = [];

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

      const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?place_id=${params.placeId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });

      accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);

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
      }
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as BackendServicepoint;
      entranceData = {} as BackendEntrance;
      accessibilityPlaceData = [];
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
      accessibilityPlaceData,
    },
  };
};

export default AccessibilityPlace;
