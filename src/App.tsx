import { Provider } from "react-redux";
import DistributionCalculator from "./components/react/DistributionCalculator";
import ExamplesSidebar from "./components/react/ExamplesSidebar";
import HeaderPanel from "./components/react/HeaderPanel";
import LearnMoreHeader from "./components/react/LearnMoreHeader";
import { Actions } from "./logic/redux/actions";
import {
  configureStoreWithInitSettings,
  safeDispatchMiddleware,
} from "./logic/redux/reducer";
import { getPartialInitSettingsFromURLParams } from "./logic/utils";

const initSettings = getPartialInitSettingsFromURLParams(
  new URLSearchParams(window.location.search)
);
const storeRef = configureStoreWithInitSettings(initSettings);

window.onpopstate = (e) => {
  let href: string = e.state?.page || "";
  let initSettings = getPartialInitSettingsFromURLParams(
    new URLSearchParams(href)
  );
  safeDispatchMiddleware.dispatch(Actions.reset(initSettings));
};

const App = () => {
  return (
    <Provider store={storeRef}>
      <HeaderPanel />
      <div className="md:flex">
        <div className="mt-5">
          <ExamplesSidebar />
        </div>

        <div className="flex-grow mt-5">
          <div className="max-w-4xl p-3">
            <LearnMoreHeader />
            <div className="mt-5">
              <DistributionCalculator></DistributionCalculator>
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default App;
