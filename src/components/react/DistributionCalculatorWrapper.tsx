import { Provider } from "react-redux";
import DistributionCalculator from "./DistributionCalculator";
import { store } from "./store";

const DistributionCalculatorWrapper = () => {
  return (
    <Provider store={store}>
      <DistributionCalculator></DistributionCalculator>
    </Provider>
  );
};

export default DistributionCalculatorWrapper;
