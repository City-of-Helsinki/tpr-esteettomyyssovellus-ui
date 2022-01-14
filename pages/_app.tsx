import React, { ReactElement } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { AppProps } from "next/app";
import { I18nProvider } from "next-localization";
import { useRouter } from "next/router";
import { defaultLocale } from "../utils/i18n";
import store, { persistor } from "../state/store";
import "../styles/global.scss";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  // This function is called when doing both server-side and client-side rendering
  const router = useRouter();
  const { lngDict, ...rest } = pageProps;
  const locale = router.locale || router.defaultLocale || defaultLocale;

  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    import("@axe-core/react").then((axe) => {
      axe.default(React, ReactDOM, 1000, {});
    });
  }

  return (
    <I18nProvider lngDict={lngDict ? lngDict[locale] : {}} locale={locale}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Component {...rest} />
        </PersistGate>
      </Provider>
    </I18nProvider>
  );
};

export default App;
