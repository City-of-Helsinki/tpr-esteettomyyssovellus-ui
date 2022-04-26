import { NextRouter } from "next/router";
import proj4 from "proj4";
import publicIp from "public-ip";
import crypto from "crypto";
import getOrigin from "./request";
import { BackendEntranceSentence } from "../types/backendModels";
import {
  API_AZURE_UPLOAD,
  API_FETCH_ANSWER_LOGS,
  API_FETCH_QUESTION_ANSWERS,
  API_FETCH_QUESTION_BLOCK_ANSWER_FIELD,
  API_GENERATE_SENTENCES,
  API_SAVE_PLACE_ANSWER,
  API_SAVE_PLACE_ANSWER_BOX,
  API_SAVE_PLACE_ANSWER_BOX_TEXT,
  LanguageLocales,
} from "../types/constants";
import { API_TOKEN } from "./checksumSecret";
import { EntrancePlaceBox } from "../types/general";
/*
import { QuestionAnswerPhoto } from "../types/backendModels";
import {
  API_FETCH_QUESTION_ANSWER_COMMENTS,
  API_FETCH_QUESTION_ANSWER_LOCATIONS,
  API_FETCH_QUESTION_ANSWER_PHOTOS,
  API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS,
} from "../types/constants";
import { AdditionalInfoProps } from "../types/general";
*/

export const validateChecksum = (string: string, checksum: string | string[]): boolean => {
  const hash = crypto.createHash("sha256").update(string).digest("hex").toUpperCase();
  return hash === checksum;
};

export const getTokenHash = () => {
  const hash = crypto.createHash("sha256").update(API_TOKEN).digest("hex").toUpperCase();
  return hash.toLocaleLowerCase();
};

export const getCurrentDate = (): string => {
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}T${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}Z`;
  return date;
};

export const getFinnishDate = (jsonTimeStamp: Date): string => {
  const date = new Date(jsonTimeStamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const finnish_date = `${day}.${month}.${year}`;
  return finnish_date;
};

export const filterByLanguage = (dict: BackendEntranceSentence[], locale: string): BackendEntranceSentence[] => {
  const localeId: number = LanguageLocales[locale as keyof typeof LanguageLocales];

  return dict.filter((entry) => {
    return entry.language_id === localeId;
  });
};

export const formatAddress = (streetName?: string, streetNumber?: string, city?: string) => {
  return `${streetName ?? ""} ${streetNumber ?? ""}${streetName || streetNumber ? ", " : ""}${city ?? ""}`;
};

// Helper function
export const isLocationValid = (coordinates: [number, number] | number[]): boolean =>
  coordinates && coordinates.length === 2 && coordinates[0] > 0 && coordinates[1] > 0;

// define CRS's here, can be made as a list, need to add named crs here to be able to use it's name in conversion
proj4.defs("EPSG:3067", "+title=EPSG:3067 +proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// convert coordinates from proj to another proj
// returns coordinates in [x, y] / [lon, lat] / [pituus, leveys]
// notice for be able to convert another crs than epsg3067 - WGS84 need to add them to defs above
export const convertCoordinates = (fromProjection: string, toProjection: string, coordinates: [number, number]): [number, number] => {
  if (!isLocationValid(coordinates)) return [0, 0];
  return proj4(fromProjection, toProjection, coordinates);
};

export const postData = async (url: string, dataToPost: string, router: NextRouter): Promise<void> => {
  const postAnswerOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    // body: JSON.stringify(dataToPost),
    body: dataToPost,
  };
  await fetch(`${getOrigin(router)}/${url}`, postAnswerOptions);
};

export const getClientIp = async (): Promise<string> =>
  publicIp.v4({
    fallbackUrls: ["https://ifconfig.co/ip"],
  });

interface KeyValue {
  [key: number]: string;
}

const saveExtraFieldAnswers = async (logId: number, extraAnswers: KeyValue, router: NextRouter) => {
  const extraFieldPosts = Object.keys(extraAnswers).map(async (questionBlockFieldIdStr) => {
    const questionBlockFieldId = Number(questionBlockFieldIdStr);
    const extraAnswer = extraAnswers[questionBlockFieldId];

    await postData(
      API_FETCH_QUESTION_BLOCK_ANSWER_FIELD,
      JSON.stringify({
        log_id: logId,
        question_block_field_id: questionBlockFieldId,
        entry: extraAnswer,
      }),
      router
    );
  });

  await Promise.all(extraFieldPosts);
};

const saveEntrancePlaces = async (logId: number, servicePointId: number, entrancePlaceBoxes: EntrancePlaceBox[], router: NextRouter) => {
  console.log("saveEntrancePlaces", servicePointId, entrancePlaceBoxes);

  const placeBoxRequests = entrancePlaceBoxes.map(async (box) => {
    // Save the entrance place first to get the place answer id
    const placeRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
      body: JSON.stringify({
        log_id: logId,
        place_id: box.place_id,
      }),
    };

    const placeResponse = await fetch(`${getOrigin(router)}/${API_SAVE_PLACE_ANSWER}`, placeRequest);
    const placeAnswer = await (placeResponse.json() as Promise<{ place_answer_id: number }>);

    console.log("box", box);
    console.log("place", box.place_id, "place_answer_id", placeAnswer.place_answer_id);

    // Use the place answer id to save the place box and its data
    if (box.modifiedBox && !box.isDeleted) {
      // New or modified box
      let photoUrl = box.modifiedBox?.photo_url;

      if (box.photoBase64) {
        // Uploaded photo, save to Azure first to get the url for the database
        const imageRequest = {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            file: box.photoBase64,
          }),
        };

        const imageResponse = await fetch(`${getOrigin(router)}/${API_AZURE_UPLOAD}${servicePointId}/`, imageRequest);
        const imageJson = await (imageResponse.json() as Promise<{ status: string; uploaded_file_name: string; url: string }>);

        console.log("place", box.place_id, "imageJson", imageJson);

        photoUrl = imageJson.url;
      }

      // Save the place box using the specified image url or Azure url created above
      const boxRequest = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          place_answer_id: placeAnswer.place_answer_id,
          // loc_easting,
          // loc_northing,
          photo_url: photoUrl,
          photo_source_text: box.modifiedBox?.photo_source_text,
          order_number: box.order_number,
        }),
      };

      const boxResponse = await fetch(`${getOrigin(router)}/${API_SAVE_PLACE_ANSWER_BOX}`, boxRequest);
      const boxJson = await (boxResponse.json() as Promise<{ box_id: number }>);

      console.log("place", box.place_id, "boxJson", boxJson);

      // Save the photo text for each language if available
      const languages = ["fi", "sv", "en"];
      languages.forEach(async (lang) => {
        if (box.modifiedBox) {
          const boxText = box.modifiedBox[`photo_text_${lang}`] as string;

          if (boxText && boxText.length > 0) {
            await postData(
              API_SAVE_PLACE_ANSWER_BOX_TEXT,
              JSON.stringify({
                box_id: boxJson.box_id,
                language_id: LanguageLocales[lang as keyof typeof LanguageLocales],
                box_text_type: "PHOTO",
                box_text: boxText,
              }),
              router
            );
          }
        }
      });
    } else if (box.isDeleted) {
      // TODO - delete place box data and images
    }
  });

  await Promise.all(placeBoxRequests);
};

export const saveFormData = async (
  servicePointId: number,
  entranceId: number,
  answeredChoices: number[],
  extraAnswers: KeyValue,
  entrancePlaceBoxes: EntrancePlaceBox[],
  startedAnswering: string,
  user: string,
  isDraft: boolean,
  router: NextRouter
): Promise<void> => {
  // DATE FOR FINISHED ANSWERING
  const finishedAnswering = getCurrentDate();

  // THIS RETURNS THE IP ADDRESS OF THE CLIENT USED IN THE ANSWER LOG
  const ipAddress = await getClientIp();

  if (entranceId > 0) {
    // POST ANSWER LOG
    // TODO: ERRORCHECK VALUES
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
      body: JSON.stringify({
        ip_address: ipAddress,
        started_answering: startedAnswering,
        finished_answering: finishedAnswering,
        form_submitted: isDraft ? "D" : "Y",
        form_cancelled: "N",
        accessibility_editor: user,
        entrance: entranceId,
      }),
    };

    // POST TO AR_X_ANSWER_LOG. RETURNS NEW LOG_ID USED FOR OTHER POST REQUESTS
    const response = await fetch(`${getOrigin(router)}/${API_FETCH_ANSWER_LOGS}`, requestOptions);
    const logId = await (response.json() as Promise<number>);

    // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
    if (logId > 0) {
      // POST ALL QUESTION ANSWERS
      const questionAnswerData = { log: logId, data: answeredChoices };
      await postData(API_FETCH_QUESTION_ANSWERS, JSON.stringify(questionAnswerData), router);

      // await postAdditionalInfo(logId, additionalInfo.additionalInfo);
      await saveExtraFieldAnswers(logId, extraAnswers, router);
      await saveEntrancePlaces(logId, servicePointId, entrancePlaceBoxes, router);

      // GENERATE SENTENCES
      // This may take a few seconds, so use await before continuing
      const generateData = { entrance_id: entranceId, form_submitted: isDraft ? "D" : "Y" };
      await postData(API_GENERATE_SENTENCES, JSON.stringify(generateData), router);
    }
  }
};

// The additional info structure will be changing, so the backend calls have been removed for now
/*
export const postAdditionalInfo = async (logId: number, data: AdditionalInfoProps): Promise<void> => {
  console.log("Started posting additional info");
  Object.keys(data)
    .filter((key) => !Number.isNaN(Number(key)))
    .forEach((question) => {
      const additionalInfo = data[question];

      if (question !== undefined) {
        const { comments, pictures, locations } = additionalInfo;

        // COMMENTS
        if (comments !== undefined) {
          Object.keys(comments).forEach((key) => {
            const comment = comments[key];
            let language = 0;
            switch (key) {
              case "fi":
                language = 1;
                break;
              case "sv":
                language = 2;
                break;
              case "en":
                language = 3;
                break;
              default:
                language = 1;
            }
            const commentData = {
              comment,
              log: logId,
              question,
              language,
            };
            postData(API_FETCH_QUESTION_ANSWER_COMMENTS, JSON.stringify(commentData), router);
            console.log("Posted additionalinfo comments for question ", question[0]);
          });
        }

        // LOCATION
        if (locations !== undefined) {
          const locationData = {
            loc_easting: locations.locEasting,
            loc_northing: locations.locNorthing,
            log: logId,
            question: question[0],
          };
          postData(API_FETCH_QUESTION_ANSWER_LOCATIONS, JSON.stringify(locationData), router);
          console.log("Posted additionalinfo location for question ", question[0]);
        }

        // PICTURES
        if (pictures !== undefined) {
          pictures.map(async (pic) => {
            const pictureData = {
              photo_url: pic.url,
              log: logId,
              question: pic.qNumber,
            };
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pictureData),
            };
            const response = await fetch(`${getOrigin(router)}/${API_FETCH_QUESTION_ANSWER_PHOTOS}`, requestOptions);
            const responseData = await (response.json() as Promise<QuestionAnswerPhoto>);
            console.log("Posted additionalinfo pictures for question ", question[0]);
            const photoId = responseData !== null ? responseData.answer_photo_id : null;

            const fiComment = pic.altText.fi;
            const svComment = pic.altText.sv;
            const enComment = pic.altText.en;
            if (photoId !== null) {
              if (fiComment !== "") {
                const pictureTextData = {
                  photo_text: fiComment,
                  answer_photo: photoId,
                  language: 1,
                };
                postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, JSON.stringify(pictureTextData), router);
                // console.log("Posted additionalinfo picture text in fi for question ", question[0]);
              }
              if (svComment !== "") {
                const pictureTextData = {
                  photo_text: svComment,
                  answer_photo: photoId,
                  language: 2,
                };
                postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, JSON.stringify(pictureTextData), router);
                // console.log("Posted additionalinfo picture text in sv ");
              }
              if (enComment !== "") {
                const pictureTextData = {
                  photo_text: enComment,
                  answer_photo: photoId,
                  language: 3,
                };
                postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, JSON.stringify(pictureTextData), router);
                // console.log("Posted additionalinfo picture text in en");
              }
              console.log("Posted additionalinfo picture texts for question ", question[0]);
            }
          });
        }
      }
    });
};
*/
