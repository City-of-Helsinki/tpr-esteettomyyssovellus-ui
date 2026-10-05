export const defaultLocale = "fi";

const i18nLoader = async (locale: string): Promise<Record<string, Record<string, unknown>>> => {
  const lngDict = require(`../locales/${locale || defaultLocale}.json`) as { [key: string]: unknown };

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

export const i18nLoaderMultiple = async (locales?: string[]): Promise<Record<string, Record<string, unknown>>> => {
  if (locales && locales.length > 0) {
    const promises = Promise.all(locales.map((locale) => i18nLoader(locale)));
    return (await promises).reduce((acc, item) => ({ ...acc, ...item }), {});
  }
  return i18nLoader(defaultLocale);
};

export default i18nLoaderMultiple;
