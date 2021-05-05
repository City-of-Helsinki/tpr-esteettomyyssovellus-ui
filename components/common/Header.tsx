// this files code from marketing project: needs editing or deleting

import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { Navigation, IconSignout } from "hds-react";
import { defaultLocale } from "../../utils/i18n";
// import getOrigin from "../../utils/request";

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

  // const currentUser = useSelector((state: RootState) => state.general.user);

  const changeLanguage = (locale: string) => {
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(router.pathname, router.asPath, { locale, shallow: true });
  };

  // this files code from marketing project: needs editing or deleting
  // const signIn = () => {
  //   const {
  //     location: { pathname },
  //   } = window;

  //   window.open(`${getOrigin(router)}/helauth/login/?next=${pathname}`, "_self");
  // };

  // const signOut = async () => {
  //   // TODO: Improve logout: remove cookies?
  //   await fetch(`${getOrigin(router)}/api/user/logout`);
  //   window.open("https://api.hel.fi/sso/openid/end-session/", "_self");
  // };

  return (
    <DynamicNavigation
      // @ts-ignore: The HDS Navigation component comes from a dynamic import, see above for details
      title={i18n.t("common.header.title")}
      titleAriaLabel={i18n.t("common.header.titleAlt")}
      titleUrl={`${router.basePath}/`}
      menuToggleAriaLabel="menu"
      skipTo="#content"
      skipToContentLabel={i18n.t("common.header.skipToContent")}
    >
      {children}
      <Navigation.Actions>
        {/* this files code from marketing project: needs editing or deleting */}
        {/* <Navigation.User
          label={i18n.t("common.header.login")}
          authenticated={currentUser?.authenticated}
          userName={currentUser?.first_name || currentUser?.email}
          onSignIn={signIn}
        >
          <Navigation.Item
            as="a"
            href="#"
            variant="supplementary"
            icon={<IconSignout aria-hidden />}
            label={i18n.t("common.header.logout")}
            onClick={signOut}
          />
        </Navigation.User> */}

        {includeLanguageSelector && (
          <Navigation.LanguageSelector label={(router.locale || defaultLocale).toUpperCase()}>
            <Navigation.Item label="Suomeksi" onClick={() => changeLanguage("fi")} />
            <Navigation.Item label="På svenska" onClick={() => changeLanguage("sv")} />
            <Navigation.Item label="In English" onClick={() => changeLanguage("en")} />
          </Navigation.LanguageSelector>
        )}
      </Navigation.Actions>
    </DynamicNavigation>
  );
};

Header.defaultProps = {
  includeLanguageSelector: true,
  children: [],
};

export default Header;
