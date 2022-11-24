import { Provider } from "react-redux";
import { store } from "../../logic/redux/reducer";
import DistributionCalculator from "./DistributionCalculator";

const DistributionCalculatorWrapper = () => {
  return (
    <Provider store={store}>
      <DistributionCalculator></DistributionCalculator>
    </Provider>
  );
};

export default DistributionCalculatorWrapper;
