import React, { ReactElement, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import Layout from "../../../../components/common/Layout";
import LoadSpinner from "../../../../components/common/LoadSpinner";
import PageHelp from "../../../../components/common/PageHelp";
import ValidationSummary from "../../../../components/common/ValidationSummary";
import AccessibilityPlaceBox from "../../../../components/AccessibilityPlaceBox";
import AccessibilityPlaceCtrlButtons from "../../../../components/AccessibilityPlaceCtrlButtons";
import AccessibilityPlaceNewButton from "../../../../components/AccessibilityPlaceNewButton";
import { useAppDispatch, useAppSelector, useLoading } from "../../../../state/hooks";
import { addEntrancePlaceBox } from "../../../../state/reducers/additionalInfoSlice";
import { formatAddress, getTokenHash } from "../../../../utils/utilFunctions";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_URL_BASE,
  LanguageLocales,
} from "../../../../types/constants";
import {
  BackendEntrance,
  BackendEntrancePlace,
  BackendFormGuide,
  BackendPlace,
  BackendServicepoint,
  Entrance,
  EntranceResults,
} from "../../../../types/backendModels";
import { AccessibilityPlaceProps, EntrancePlaceBox } from "../../../../types/general";
import i18nLoader from "../../../../utils/i18n";
import { getMaxLogId, validateServicepointHash } from "../../../../utils/serverside";
import styles from "./accessibilityPlace.module.scss";

// usage: the accessibility place of a question
const AccessibilityPlace = ({
  servicepointData,
  entranceData,
  accessibilityPlaceData,
  placeId,
  formGuideData,
  formId,
  isChecksumValid,
}: AccessibilityPlaceProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const isLoading = useLoading();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);
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
  const entrancePlaceValidationTime = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceValidationTime);

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
  const filteredDeletedEntrancePlaceBoxes = curEntrancePlaceBoxes
    ? curEntrancePlaceBoxes.filter((placeBox) => {
        return placeBox.place_id === filteredPlaceData.place_id && placeBox.isDeleted;
      })
    : [];

  const initPlaceBoxes = () => {
    // Add a new entrance place box if none have been added yet
    if (filteredEntrancePlaceBoxes.length === 0) {
      const newBox: EntrancePlaceBox = {
        entrance_id: curEntranceId,
        question_block_id: -1,
        place_id: filteredPlaceData.place_id,
        order_number: 1,
        modifiedBox: {} as BackendEntrancePlace,
        isDeleted: false,
        termsAccepted: false,
        invalidValues: [],
      };
      dispatch(addEntrancePlaceBox(newBox));
    }
  };

  const canAddLocation = filteredPlaceData.can_add_location === "Y";

  // Initialise the entrance place box data on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(initPlaceBoxes);

  const treeItems = {
    [servicepointData.servicepoint_name ?? ""]: hasData ? `/details/${servicepointData.servicepoint_id}?checksum=${checksum}` : "",
    [i18n.t("servicepoint.contactFormSummaryHeader")]:
      curEntranceId > 0
        ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}`
        : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}`,
    [`${i18n.t("additionalInfo.additionalInfo")} > ${filteredPlaceData.name}`]:
      curEntranceId > 0
        ? `/accessibilityPlace/${curServicepointId}/${placeId}/${curEntranceId}?checksum=${checksum}`
        : `/accessibilityPlace/${curServicepointId}/${placeId}?checksum=${checksum}`,
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      {!isChecksumValid && <h1>{i18n.t("common.invalidParams")}</h1>}

      {isChecksumValid && !isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isChecksumValid && isUserValid && isLoading && <LoadSpinner />}

      {isChecksumValid && isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isChecksumValid && isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.infocontainer}>
              <PageHelp formGuideData={formGuideData} treeItems={treeItems} />
            </div>

            <div className={styles.headingcontainer}>
              <h1>{servicepointData.servicepoint_name}</h1>
              <div className={styles.subHeader}>{subHeader}</div>

              <div className={styles.mainbuttons}>
                <AccessibilityPlaceCtrlButtons
                  placeId={filteredPlaceData.place_id}
                  entrancePlaceBoxes={filteredEntrancePlaceBoxes}
                  deletedEntrancePlaceBoxes={filteredDeletedEntrancePlaceBoxes}
                />
                {!curEntrancePlaceValid && (
                  <ValidationSummary
                    pageValid={curEntrancePlaceValid}
                    validationSummary={filteredEntrancePlaceInvalidValues}
                    validationTime={entrancePlaceValidationTime}
                  />
                )}
              </div>

              <div className={styles.infoHeader}>{`${i18n.t("additionalInfo.additionalInfo")} > ${filteredPlaceData.name}`}</div>
              <div className={styles.infoText}>
                <div>{`${i18n.t("additionalInfo.fillPlaceData1")} '${filteredPlaceData.name}' ${i18n.t("additionalInfo.fillPlaceData2")}${
                  canAddLocation ? ` ${i18n.t("additionalInfo.fillPlaceData3")}.` : "."
                }`}</div>
                <div>{i18n.t("additionalInfo.orderPlaceData")}</div>
                <div>{i18n.t("additionalInfo.mandatoryPlaceData")}</div>
              </div>
            </div>

            <div>
              {filteredEntrancePlaceBoxes.map((entrancePlaceBox, index) => {
                const key = `box_${index}`;
                return (
                  <AccessibilityPlaceBox
                    key={key}
                    entrancePlaceBox={entrancePlaceBox}
                    entrancePlaceName={filteredPlaceData.name || ""}
                    canAddLocation={canAddLocation}
                    isFirst={entrancePlaceBox.order_number === 1}
                    isLast={entrancePlaceBox.order_number === filteredEntrancePlaceBoxes.length}
                  />
                );
              })}
            </div>

            <div className={styles.footercontainer}>
              <div className={styles.footerbutton}>
                <AccessibilityPlaceNewButton accessibilityPlaceData={filteredPlaceData} orderNumber={filteredEntrancePlaceBoxes.length + 1} />
              </div>
              <div className={styles.footerbutton}>
                <AccessibilityPlaceCtrlButtons
                  placeId={filteredPlaceData.place_id}
                  entrancePlaceBoxes={filteredEntrancePlaceBoxes}
                  deletedEntrancePlaceBoxes={filteredDeletedEntrancePlaceBoxes}
                />
              </div>
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, query, locales }) => {
  const lngDict = await i18nLoader(locales);

  let entranceData: BackendEntrance = {} as BackendEntrance;
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let accessibilityPlaceData: BackendPlace[] = [];
  let placeId = -1;
  let formGuideData: BackendFormGuide[] = [];
  let formId = -1;

  const isChecksumValid = params !== undefined && query !== undefined && validateServicepointHash(Number(params.servicepointId), query.checksum);

  if (isChecksumValid && params !== undefined) {
    try {
      placeId = Number(params.placeId);

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
          // Return entrance data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          const maxLogId = getMaxLogId(entranceDetail);
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
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
      accessibilityPlaceData,
      placeId,
      formGuideData,
      formId,
      isChecksumValid,
    },
  };
};

export default AccessibilityPlace;
