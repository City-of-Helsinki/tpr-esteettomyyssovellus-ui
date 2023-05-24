import { NextRouter } from "next/router";
import proj4 from "proj4";
import { publicIpv4 } from "public-ip";
import crypto from "crypto";
import getOrigin from "./request";
import { BackendEntranceSentence } from "../types/backendModels";
import {
  API_AZURE_UPLOAD,
  API_DELETE_PLACE_BOX_TEXT_SUFFIX,
  API_DELETE_PLACE_FROM_ANSWER,
  API_FETCH_ANSWER_LOGS,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTION_ANSWERS,
  API_FETCH_QUESTION_BLOCK_ANSWER_FIELD,
  API_GENERATE_SENTENCES,
  API_SAVE_PLACE_ANSWER,
  API_SAVE_PLACE_ANSWER_BOX,
  API_SAVE_PLACE_ANSWER_BOX_TEXT,
  API_SAVE_QUESTION_BLOCK_ANSWER,
  API_SAVE_QUESTION_BLOCK_ANSWER_TEXT,
  API_SAVE_QUESTION_BLOCK_COMMENT,
  LanguageLocales,
} from "../types/constants";
import { API_TOKEN } from "./checksumSecret";
import { EntranceLocationPhoto, EntrancePlaceBox, KeyValueString, QuestionBlockComment } from "../types/general";

export const validateChecksum = (inputString: string, checksum: string): boolean => {
  const hash = crypto.createHash("sha256").update(inputString).digest("hex").toUpperCase();
  return hash.toLocaleLowerCase() === checksum.toLocaleLowerCase();
};

export const validateDate = (validUntil: string): boolean => {
  const validUntilDate = new Date(validUntil);
  const now = new Date();
  return now < validUntilDate;
};

export const getTokenHash = (): string => {
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
export const isLocationValid = (coordinates: [number, number] | number[]): boolean => {
  return coordinates && coordinates.length === 2 && coordinates[0] > 0 && coordinates[1] > 0;
};

// define CRS's here, can be made as a list, need to add named crs here to be able to use it's name in conversion
proj4.defs("EPSG:3067", "+title=EPSG:3067 +proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// convert coordinates from proj to another proj
// returns coordinates in [x, y] / [lon, lat] / [pituus, leveys]
// notice for be able to convert another crs than epsg3067 - WGS84 need to add them to defs above
export const convertCoordinates = (fromProjection: string, toProjection: string, coordinates: [number, number]): [number, number] => {
  if (!isLocationValid(coordinates)) {
    return [0, 0];
  }
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
  publicIpv4({
    fallbackUrls: ["https://ifconfig.co/ip"],
  });

export const splitTextUrls = (text: string) => {
  // Try to split the text into urls and other text, so that the urls can be converted into clickable links
  const regex = /((?:http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(?:\/\S*)?)/g;
  return text.split(regex).filter((t) => t.length > 0);
};

const saveExtraFieldAnswers = async (logId: number, extraAnswers: KeyValueString, router: NextRouter) => {
  // Save extra field answers to the database such as contact information
  await Promise.all(
    Object.keys(extraAnswers).map(async (questionBlockFieldIdStr) => {
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
    })
  );
};

const getEntrancePlaceIdsToSave = async (logId: number, entrancePlaceBoxes: EntrancePlaceBox[], router: NextRouter) => {
  // Determine the distinct entrance place ids from the place boxes
  const distinctPlaceIds = entrancePlaceBoxes.map((box) => box.place_id).filter((v, i, a) => a.indexOf(v) === i);

  // Get an array of the entrance place ids to be saved rather than deleted
  const placeIdsToSave = await Promise.all(
    distinctPlaceIds.map(async (placeId) => {
      // Check if all boxes for this entrance place have been marked as deleted
      const isPlaceToBeDeleted = entrancePlaceBoxes.filter((box) => box.place_id === placeId).every((box) => box.isDeleted);

      if (isPlaceToBeDeleted) {
        // All the boxes are to be deleted, so delete the whole entrance place
        const deletePlaceRequest = {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
          body: JSON.stringify({
            log_id: logId,
            place_id: placeId,
          }),
        };

        const deletePlaceResponse = await fetch(`${getOrigin(router)}/${API_DELETE_PLACE_FROM_ANSWER}`, deletePlaceRequest);
        console.log("delete place response", deletePlaceResponse);
      } else {
        // The entrance place has something to be saved
        return placeId;
      }
    })
  );

  // Remove any undefined values from the array
  return placeIdsToSave.filter((placeId) => placeId !== undefined) as number[];
};

const getEntrancePlaceAnswerIds = async (logId: number, entrancePlaceIdsToSave: number[], router: NextRouter) => {
  // Get an array of place answer ids for each entrance place id
  const placeAnswerIdArray = await Promise.all(
    entrancePlaceIdsToSave.map(async (placeId) => {
      const placeRequest = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          log_id: logId,
          place_id: placeId,
        }),
      };

      const placeResponse = await fetch(`${getOrigin(router)}/${API_SAVE_PLACE_ANSWER}`, placeRequest);
      const placeAnswer = await (placeResponse.json() as Promise<{ place_answer_id: number }>);

      return { [placeId]: placeAnswer.place_answer_id };
    })
  );

  // Convert the array to an object for easier lookups
  return placeAnswerIdArray.reduce((acc, placeAnswerObj) => {
    return { ...acc, ...placeAnswerObj };
  }, {});
};

const uploadPictureToAzure = async (servicePointId: number, photoBase64: string, router: NextRouter) => {
  // Upload the picture to Azure via the backend
  const imageRequest = {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    body: JSON.stringify({
      file: photoBase64,
    }),
  };

  let imageResult = "";

  try {
    const imageResponse = await fetch(`${getOrigin(router)}/${API_AZURE_UPLOAD}${servicePointId}/`, imageRequest);

    // The response should be json, but get it first as text then parse it
    // If the azure access token has expired, the response will be an error message instead of json
    imageResult = await imageResponse.text();

    const imageJson = JSON.parse(imageResult) as { status: string; uploaded_file_name: string; url: string };

    console.log("imageJson", imageJson);

    return imageJson.url;
  } catch {
    console.error("Image upload error:", imageResult);
  }
};

const saveEntrancePlaceBox = async (entrancePlaceBox: EntrancePlaceBox, placeAnswerId: number, router: NextRouter, photoUrl?: string) => {
  console.log("saveEntrancePlaceBox", placeAnswerId, entrancePlaceBox);

  if (entrancePlaceBox.modifiedBox && placeAnswerId > 0) {
    const { modifiedBox, order_number } = entrancePlaceBox;

    // Save the entrance place box using the specified photo url or Azure url created earlier
    const boxRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
      body: JSON.stringify({
        place_answer_id: placeAnswerId,
        ...(modifiedBox.loc_easting !== undefined && { loc_easting: modifiedBox.loc_easting }),
        ...(modifiedBox.loc_northing !== undefined && { loc_northing: modifiedBox.loc_northing }),
        ...(photoUrl && { photo_url: photoUrl }),
        ...(photoUrl && { photo_source_text: modifiedBox.photo_source_text ?? "" }),
        order_number: order_number,
      }),
    };

    const boxResponse = await fetch(`${getOrigin(router)}/${API_SAVE_PLACE_ANSWER_BOX}`, boxRequest);
    const boxJson = await (boxResponse.json() as Promise<{ box_id: number }>);

    console.log("place", entrancePlaceBox.place_id, "boxJson", boxJson);

    // Save the photo text for each language if available
    const languages = ["fi", "sv", "en"];
    languages.forEach(async (lang) => {
      if (modifiedBox && boxJson.box_id > 0) {
        const locationText = modifiedBox[`location_text_${lang}`] as string;
        const photoText = modifiedBox[`photo_text_${lang}`] as string;

        if (locationText && locationText.length > 0) {
          await postData(
            API_SAVE_PLACE_ANSWER_BOX_TEXT,
            JSON.stringify({
              box_id: boxJson.box_id,
              language_id: LanguageLocales[lang as keyof typeof LanguageLocales],
              box_text_type: "LOCATION",
              box_text: locationText,
            }),
            router
          );
        }

        if (photoText && photoText.length > 0) {
          await postData(
            API_SAVE_PLACE_ANSWER_BOX_TEXT,
            JSON.stringify({
              box_id: boxJson.box_id,
              language_id: LanguageLocales[lang as keyof typeof LanguageLocales],
              box_text_type: "PHOTO",
              box_text: photoText,
            }),
            router
          );
        }
      }
    });
  }
};

const deleteEntrancePlaceBox = async (entrancePlaceBox: EntrancePlaceBox, router: NextRouter) => {
  console.log("deleteEntrancePlaceBox", entrancePlaceBox);

  if (entrancePlaceBox.modifiedBox) {
    const boxId = entrancePlaceBox.modifiedBox.box_id;

    // Delete the photo texts first
    const boxTextRequest = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    };

    const boxTextResponse = await fetch(
      `${getOrigin(router)}/${API_SAVE_PLACE_ANSWER_BOX}${boxId}/${API_DELETE_PLACE_BOX_TEXT_SUFFIX}`,
      boxTextRequest
    );
    console.log("box text delete response", boxTextResponse);

    // Delete the place box next
    // The images will be removed from Azure by the backend
    const boxRequest = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    };

    const boxResponse = await fetch(`${getOrigin(router)}/${API_SAVE_PLACE_ANSWER_BOX}${boxId}/`, boxRequest);
    console.log("box delete response", boxResponse);
  }
};

const saveEntrancePlaces = async (logId: number, servicePointId: number, entrancePlaceBoxes: EntrancePlaceBox[], router: NextRouter) => {
  console.log("saveEntrancePlaces", servicePointId, entrancePlaceBoxes);

  if (entrancePlaceBoxes && entrancePlaceBoxes.length > 0) {
    // Get the entrance place ids to save, and delete any places that have nothing to be saved
    const placeIdsToSave = await getEntrancePlaceIdsToSave(logId, entrancePlaceBoxes, router);

    console.log("placeIdsToSave", placeIdsToSave);

    if (placeIdsToSave.length > 0) {
      // Save the entrance places to get place answer ids, since the combination of log_id and place_id is unique
      const placeAnswerIds = await getEntrancePlaceAnswerIds(logId, placeIdsToSave, router);

      console.log("placeAnswerIds", placeAnswerIds);

      // Save the entrance place boxes and their data using the place answer ids
      placeIdsToSave.forEach((placeId) => {
        const boxesToSave = entrancePlaceBoxes.filter((box) => box.place_id === placeId);

        boxesToSave.forEach(async (box) => {
          const placeAnswerId = placeAnswerIds[box.place_id];

          console.log("box", box);
          console.log("place", box.place_id, "placeAnswerId", placeAnswerId);

          if (box.modifiedBox && !box.isDeleted) {
            // New or modified place box
            // Use the specified photo url or upload an imported photo to Azure
            let photoUrl = box.modifiedBox?.photo_url;
            if (box.modifiedPhotoBase64) {
              // Uploaded photo, save to Azure first to get the url for the database
              photoUrl = await uploadPictureToAzure(servicePointId, box.modifiedPhotoBase64, router);
            }

            // Save the entrance place box
            saveEntrancePlaceBox(box, placeAnswerId, router, photoUrl);
          } else if (box.isDeleted) {
            // Deleted place box
            deleteEntrancePlaceBox(box, router);
          }
        });
      });
    }
  }
};

const saveEntranceLocationPhoto = async (logId: number, servicePointId: number, entranceLocationPhoto: EntranceLocationPhoto, router: NextRouter) => {
  console.log("saveEntranceLocationPhoto", servicePointId, entranceLocationPhoto);

  if (entranceLocationPhoto && entranceLocationPhoto.modifiedAnswer && entranceLocationPhoto.question_block_id > 0) {
    const { question_block_id, modifiedAnswer, modifiedPhotoBase64 } = entranceLocationPhoto;

    // Use the specified photo url or upload an imported photo to Azure
    let photoUrl = modifiedAnswer.photo_url;
    if (modifiedPhotoBase64) {
      // Uploaded photo, save to Azure first to get the url for the database
      photoUrl = await uploadPictureToAzure(servicePointId, modifiedPhotoBase64, router);
    }

    // Save the entrance photo using the specified photo url or Azure url created above
    const answerRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
      body: JSON.stringify({
        log_id: logId,
        question_block_id: question_block_id,
        ...(modifiedAnswer.loc_easting !== undefined && { loc_easting: modifiedAnswer.loc_easting }),
        ...(modifiedAnswer.loc_northing !== undefined && { loc_northing: modifiedAnswer.loc_northing }),
        ...(photoUrl && { photo_url: photoUrl }),
        ...(photoUrl && { photo_source_text: modifiedAnswer.photo_source_text ?? "" }),
      }),
    };

    const answerResponse = await fetch(`${getOrigin(router)}/${API_SAVE_QUESTION_BLOCK_ANSWER}`, answerRequest);
    const answerJson = await (answerResponse.json() as Promise<{ question_block_answer_id: number }>);

    console.log("block", question_block_id, "answerJson", answerJson);

    // Save the photo text for each language if available
    const languages = ["fi", "sv", "en"];
    languages.forEach(async (lang) => {
      if (modifiedAnswer && answerJson.question_block_answer_id > 0) {
        const photoText = modifiedAnswer[`photo_text_${lang}`] as string;

        if (photoText && photoText.length > 0) {
          await postData(
            API_SAVE_QUESTION_BLOCK_ANSWER_TEXT,
            JSON.stringify({
              question_block_answer_id: answerJson.question_block_answer_id,
              language_id: LanguageLocales[lang as keyof typeof LanguageLocales],
              photo_text: photoText,
            }),
            router
          );
        }
      }
    });
  }
};

const saveQuestionBlockComments = async (
  logId: number,
  servicePointId: number,
  questionBlockComments: QuestionBlockComment[],
  router: NextRouter
) => {
  console.log("saveQuestionBlockComments", servicePointId, questionBlockComments);

  if (questionBlockComments && questionBlockComments.length > 0) {
    // Save the question block comments for this entrance
    questionBlockComments.forEach((comment) => {
      const { question_block_id, modifiedComment } = comment;

      console.log("comment", comment);

      // Save the comment text for each language if available
      const languages = ["fi", "sv", "en"];
      languages.forEach(async (lang) => {
        if (modifiedComment && question_block_id > 0) {
          const commentText = modifiedComment[`comment_text_${lang}`] as string;

          if (commentText && commentText.length > 0) {
            await postData(
              API_SAVE_QUESTION_BLOCK_COMMENT,
              JSON.stringify({
                log_id: logId,
                question_block_id: question_block_id,
                language_id: LanguageLocales[lang as keyof typeof LanguageLocales],
                comment: commentText,
              }),
              router
            );
          }
        }
      });
    });
  }
};

export const saveFormData = async (
  servicePointId: number,
  entranceId: number,
  answeredChoices: number[],
  extraAnswers: KeyValueString,
  entranceLocationPhoto: EntranceLocationPhoto,
  entrancePlaceBoxes: EntrancePlaceBox[],
  questionBlockComments: QuestionBlockComment[],
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

      await saveExtraFieldAnswers(logId, extraAnswers, router);
      await saveEntranceLocationPhoto(logId, servicePointId, entranceLocationPhoto, router);
      await saveEntrancePlaces(logId, servicePointId, entrancePlaceBoxes, router);
      await saveQuestionBlockComments(logId, servicePointId, questionBlockComments, router);

      // GENERATE SENTENCES
      // This may take a few seconds, so use await before continuing
      const generateData = { entrance_id: entranceId, form_submitted: isDraft ? "D" : "Y" };
      await postData(API_GENERATE_SENTENCES, JSON.stringify(generateData), router);
    }
  }
};

export const deleteEntrance = async (entranceId: number, router: NextRouter): Promise<void> => {
  if (entranceId > 0) {
    const deleteEntranceRequest = {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
    };

    const deleteEntranceResponse = await fetch(`${getOrigin(router)}/${API_FETCH_ENTRANCES}${entranceId}/delete_entrance/`, deleteEntranceRequest);
    console.log("delete entrance response", await deleteEntranceResponse.text());
  }
};
