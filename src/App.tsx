import * as React from "react";
import { connect } from "react-redux";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { accountInit } from "./redux/_account";
import { setTopLevelNavigator } from "./navigation";
import OnboardingStack from "./screens/Onboarding";
import AccountStack from "./screens/Account";
import ModalStack from "./screens/Modal";
import { deleteMnemonic } from "./helpers/wallet";
import { deleteProfile } from "./helpers/profile";

const MainStack = createStackNavigator(
  {
    Onboarding: OnboardingStack,
    Account: AccountStack
  },
  {
    initialRouteName: "Account",
    headerMode: "none",
    mode: "modal"
  }
);

const AppNavigator = createStackNavigator(
  {
    Main: MainStack,
    Modal: ModalStack
  },
  {
    initialRouteName: "Main",
    headerMode: "none",
    mode: "modal"
  }
);

const AppContainer = createAppContainer(AppNavigator);

class App extends React.Component<any, any> {
  componentDidMount() {
    this.initApp();
  }
  initApp = async () => {
    // await this.resetApp();
    this.props.accountInit();
  };
  resetApp = async () => {
    await deleteMnemonic();
    await deleteProfile(this.props.account.address);
  };
  render = () => (
    <AppContainer ref={navigatorRef => setTopLevelNavigator(navigatorRef)} />
  );
}

const reduxProps = (reduxState: any) => ({
  account: reduxState.account.account
});

export default connect(
  reduxProps,
  { accountInit }
)(App);
