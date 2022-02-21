// this files code from marketing project: needs editing or deleting

import React, { KeyboardEvent, ReactElement, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { Navigation, IconSignout } from "hds-react";
import { defaultLocale } from "../../utils/i18n";
import getOrigin from "../../utils/request";
import styles from "./Header.module.scss";

interface HeaderProps {
  children?: React.ReactNode;
}

// NOTE: The HDS Navigation component does not currently work for mobile views when server-side rendering
// A workaround for this is to only use the Navigation component on the client-side
const DynamicNavigation = dynamic(
  // @ts-ignore: A dynamic import must be used to force client-side rendering regardless of the typescript errors
  () => import("hds-react").then((hds) => hds.Navigation),
  { ssr: false }
);

const Header = ({ children }: HeaderProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();

  // const currentUser = useSelector(
  //   (state: RootState) => state.generalSlice.user
  // );

  const changeLanguage = (locale: string) => {
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(router.pathname, router.asPath, { locale, shallow: true });
  };

  // this files code from marketing project: needs editing or deleting
  const signIn = () => {
    const {
      location: { pathname },
    } = window;

    window.open(`${getOrigin(router)}/helauth/login/?next=${pathname}`, "_self");
  };

  const signOut = async () => {
    // TODO: Improve logout: remove cookies?
    await fetch(`${getOrigin(router)}/api/user/logout`);
    window.open("https://api.hel.fi/sso/openid/end-session/", "_self");
  };

  const handleKeyPress = (evt: KeyboardEvent<HTMLAnchorElement>, id: string) => {
    if (evt.code === "Enter") {
      document.getElementById(id)?.click();
    }
  };

  // This checks whether the view has become so thin, i.e. mobile view, that the languageselector component should change place.
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => setWidth(window.innerWidth));
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", () => setWidth(window.innerWidth));
      }
    };
  }, []);
  const isMobile = width < 768;
  const includeLanguageSelector = !isMobile;

  return (
    <>
      <DynamicNavigation
        // @ts-ignore: The HDS Navigation component comes from a dynamic import, see above for details
        title={i18n.t("common.header.title")}
        titleAriaLabel={i18n.t("common.header.titleAlt")}
        titleUrl={`${router.basePath}/${router.locale}`}
        menuToggleAriaLabel="menu"
        skipTo="#content"
        skipToContentLabel={i18n.t("common.header.skipToContent")}
        theme={{
          "--header-background-color": "var(--color-bus-medium-light)",
        }}
        className={styles.header}
      >
        {children}
        <Navigation.Actions>
          <div className={styles.choices} role="region">
            <Navigation.Row>
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.homepage")}
                href={`${router.basePath}/${router.locale}`}
                active={router.pathname === `/`}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.servicepoints")}
                href={`${router.basePath}/${router.locale}/servicepoints`}
                active={router.pathname.includes("servicepoint") || router.pathname.includes("accessibilityEdit")}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.information")}
                href={`${router.basePath}/${router.locale}/about`}
                active={router.pathname === `/about`}
              />
            </Navigation.Row>
          </div>

          {/* Placeholders to authenticated and username */}
          {
            <Navigation.User
              label={i18n.t("common.header.login")}
              authenticated /* Change to: currentUser?.authenticated} */
              userName="PLACEHOLDER" /* Change to: currentUser?.first_name || currentUser?.email} */
              onSignIn={signIn}
            >
              <Navigation.Item
                as="a"
                href="#"
                variant="supplementary"
                className={includeLanguageSelector ? "" : styles.logout}
                icon={!includeLanguageSelector ? "" : <IconSignout aria-hidden />}
                label={i18n.t("common.header.logout")}
                onClick={signOut}
              />
            </Navigation.User>
          }

          {includeLanguageSelector && (
            <Navigation.LanguageSelector label={(router.locale || defaultLocale).toUpperCase()}>
              <Navigation.Item
                role="button"
                id="fi"
                lang="fi"
                label="Suomeksi"
                tabIndex={0}
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "fi")}
                onClick={() => changeLanguage("fi")}
              />
              <Navigation.Item
                role="button"
                id="sv"
                lang="sv"
                label="På svenska"
                tabIndex={0}
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "sv")}
                onClick={() => changeLanguage("sv")}
              />
              <Navigation.Item
                role="button"
                id="en"
                lang="en"
                label="In English"
                tabIndex={0}
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "en")}
                onClick={() => changeLanguage("en")}
              />
            </Navigation.LanguageSelector>
          )}
          {/* Hide header language selector when view is mobile.
          Instead show a language selector in the dropdown menu of the mobile header */}
          {!includeLanguageSelector && (
            <div className={styles.mobileLanguages} role="region">
              <Navigation.Item
                role="button"
                id="fim"
                lang="fi"
                tabIndex={0}
                className={router.locale === "fi" ? styles.chosen : styles.unchosen}
                label="Suomeksi (FI)"
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "fim")}
                onClick={() => changeLanguage("fi")}
              />
              <Navigation.Item
                role="button"
                id="svm"
                lang="sv"
                tabIndex={0}
                className={router.locale === "sv" ? styles.chosen : styles.unchosen}
                label="På svenska (SV)"
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "svm")}
                onClick={() => changeLanguage("sv")}
              />
              <Navigation.Item
                role="button"
                id="enm"
                lang="en"
                tabIndex={0}
                className={router.locale === "en" ? styles.chosen : styles.unchosen}
                label="In English (EN)"
                onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "enm")}
                onClick={() => changeLanguage("en")}
              />
            </div>
          )}
        </Navigation.Actions>
      </DynamicNavigation>
    </>
  );
};

Header.defaultProps = {
  children: [],
};

export default Header;
