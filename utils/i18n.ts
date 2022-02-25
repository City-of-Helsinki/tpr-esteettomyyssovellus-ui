// this files code from marketing project: if not used / edited -> delete

export const defaultLocale = "fi";

const i18nLoader = async (locale: string): Promise<{ [locale: string]: { [key: string]: unknown } }> => {
  const { default: lngDict = {} } = await import(`../locales/${locale || defaultLocale}.json`);

  return {
    [locale]: {
      common: lngDict.common,
      servicepoint: lngDict.servicepoint,
      additionalInfo: lngDict.additionalInfo,
      questionFormControlButtons: lngDict.questionFormControlButtons,
      accessibilityForm: lngDict.accessibilityForm,
      QuestionFormImportExistingData: lngDict.QuestionFormImportExistingData,
      PreviewPage: lngDict.PreviewPage,
      AddressChangedPage: lngDict.AddressChangedPage,
    },
  };
};

export const i18nLoaderMultiple = async (locales?: string[]): Promise<{ [locale: string]: { [key: string]: unknown } }> => {
  if (locales && locales.length > 0) {
    const promises = Promise.all(
      locales.map((locale) => {
        return i18nLoader(locale);
      })
    );
    return (await promises).reduce((acc, item) => {
      return { ...acc, ...item };
    }, {});
  }
  return i18nLoader(defaultLocale);
};

export default i18nLoaderMultiple;
