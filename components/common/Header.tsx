// this files code from marketing project: needs editing or deleting

import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { Navigation, IconSignout } from "hds-react";
import { defaultLocale } from "../../utils/i18n";
import getOrigin from "../../utils/request";
import styles from "./Header.module.scss";
import { RootState } from "../../state/reducers";

interface HeaderProps {
  includeLanguageSelector?: boolean;
  children?: React.ReactNode;
}

// NOTE: The HDS Navigation component does not currently work for mobile views when server-side rendering
// A workaround for this is to only use the Navigation component on the client-side
// @ts-ignore: A dynamic import must be used to force client-side rendering regardless of the typescript errors
const DynamicNavigation = dynamic(() => import("hds-react").then((hds) => hds.Navigation), { ssr: false });

const Header = ({ includeLanguageSelector, children }: HeaderProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();

  const currentUser = useSelector((state: RootState) => state.general.user);
  console.log(currentUser);
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

  const handleKeyPress = (e: Event, id: string) => {
    var evt = e as KeyboardEvent;
    if (evt.code == "Enter") {
      document.getElementById(id)?.click();
    }
  }

  // This checks whether the view has become so thin, i.e. mobile view, that the languageselector component should change place.
  if (typeof window !== "undefined") {
    const [width, setWidth] = useState<number>(window.innerWidth);
    useEffect(() => {
      window.addEventListener('resize', () => setWidth(window.innerWidth));
      return () => {
          window.removeEventListener('resize', () => setWidth(window.innerWidth));
      }
    }, []);
    let isMobile: boolean = (width < 768);
    includeLanguageSelector = isMobile ? false : true;
  }

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
          '--header-background-color': 'var(--color-bus-medium-light)',
        }}
        className={styles.header}
      >
        {children}
        <Navigation.Actions>
          <div className={styles.choices} role="region" aria-label="Pages">
            <Navigation.Row >
              <Navigation.Item 
                role="button"
                as="a"
                label={i18n.t("common.header.homepage")} 
                href={`${router.basePath}/${router.locale}`} 
                active={router.pathname === `/`} />
              <Navigation.Item
                role="button"
                as="a" 
                label={i18n.t("common.header.servicepoints")} 
                href={`${router.basePath}/${router.locale}/servicepoints`} 
                active={router.pathname.includes('servicepoint')} />
              <Navigation.Item 
                role="button"
                as="a"
                label={i18n.t("common.header.information")} 
                href={`${router.basePath}/${router.locale}/about`}
                active={router.pathname === `/about`} />
            </Navigation.Row>
          </div>

          {/* Placeholders to authenticated and username */}
          {<Navigation.User
            label={i18n.t("common.header.login")}
            authenticated={currentUser?.authenticated}                        /* Change to: currentUser?.authenticated} */
            userName={currentUser?.first_name || currentUser?.email}               /* Change to: currentUser?.first_name || currentUser?.email} */
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
          </Navigation.User>} 

          {includeLanguageSelector && (
            <Navigation.LanguageSelector label={(router.locale || defaultLocale).toUpperCase()}>
              <Navigation.Item 
                role="button" 
                id="fi" 
                label="Suomeksi" 
                tabIndex={0} 
                onKeyPress={(e: any) => handleKeyPress(e, "fi")} 
                onClick={() => changeLanguage("fi")} />
              <Navigation.Item 
                role="button" 
                id="sv" 
                label="På svenska" 
                tabIndex={0} 
                onKeyPress={(e: any) => handleKeyPress(e, "sv")} 
                onClick={() => changeLanguage("sv")} />
              <Navigation.Item 
                role="button" 
                id="en" 
                label="In English" 
                tabIndex={0} 
                onKeyPress={(e: any) => handleKeyPress(e, "en")} 
                onClick={() => changeLanguage("en")} />
            </Navigation.LanguageSelector>)}
          {/* Hide header language selector when view is mobile. 
          Instead show a language selector in the dropdown menu of the mobile header */}
          {!includeLanguageSelector && (
          <div className={styles.mobileLanguages} role="region">
              <Navigation.Item 
                role="button" 
                id="fim" 
                tabIndex={0} 
                className={router.locale == "fi" ? styles.chosen : styles.unchosen} 
                label="Suomeksi (FI)" onKeyPress={(e: any) => handleKeyPress(e, "fim")} 
                onClick={() => changeLanguage("fi")} />
              <Navigation.Item 
                role="button" 
                id="svm" 
                tabIndex={0} 
                className={router.locale == "sv" ? styles.chosen : styles.unchosen} 
                label="På svenska (SV)" onKeyPress={(e: any) => handleKeyPress(e, "svm")} 
                onClick={() => changeLanguage("sv")} />
              <Navigation.Item 
                role="button" 
                id="enm" 
                tabIndex={0} 
                className={router.locale == "en" ? styles.chosen : styles.unchosen} 
                label="In English (EN)" onKeyPress={(e: any) => handleKeyPress(e, "enm")} 
                onClick={() => changeLanguage("en")} />
          </div>)}
        </Navigation.Actions>
      </DynamicNavigation>
    </>
  );
};

Header.defaultProps = {
  includeLanguageSelector: true,
  children: [],
};

export default Header;
