// this files code from marketing project: if not used / edited -> delete

export const defaultLocale = "fi";

const i18nLoader = async (
  locale: string,
  isModeration?: boolean
): Promise<{ [locale: string]: { [key: string]: unknown } }> => {
  const { default: lngDict = {} } = await import(
    `../locales/${locale || defaultLocale}.json`
  );

  return {
    [locale]: {
      common: lngDict.common,
      question: lngDict.question,
      servicepoint: lngDict.servicepoint,
      additionalInfo: lngDict.additionalInfo,
      questionFormControlButtons: lngDict.questionFormControlButtons,
      accessibilityForm: lngDict.accessibilityForm
    }
  };
};

export const i18nLoaderMultiple = async (
  locales?: string[],
  isModeration?: boolean
): Promise<{ [locale: string]: { [key: string]: unknown } }> => {
  if (locales && locales.length > 0) {
    const promises = Promise.all(
      locales.map((locale) => {
        return i18nLoader(locale, isModeration);
      })
    );
    return (await promises).reduce((acc, item) => {
      return { ...acc, ...item };
    }, {});
  }
  return i18nLoader(defaultLocale, isModeration);
};

export default i18nLoaderMultiple;
