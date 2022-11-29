import { Provider } from "react-redux";
import type {
  ChartMode,
  ComparatorMode,
  InitSettings,
  NumberMode,
} from "../../logic/data_types";
import { configureStoreWithInitSettings } from "../../logic/redux/reducer";
import { orUndef } from "../../logic/utils";
import DistributionCalculator from "./DistributionCalculator";

const DistributionCalculatorWrapper = () => {
  const initSettings = getInitSettingsFromURLParams();
  const store = configureStoreWithInitSettings(initSettings);

  return (
    <Provider store={store}>
      <DistributionCalculator></DistributionCalculator>
    </Provider>
  );
};

export default DistributionCalculatorWrapper;

function getInitSettingsFromURLParams(): InitSettings {
  const queryParams = new URLSearchParams(window.location.search);
  return {
    [0]: queryParams.get("d1") || undefined,
    [1]: queryParams.get("d2") || undefined,
    [2]: queryParams.get("d3") || undefined,
    cmpMode:
      asOrUndefined<ComparatorMode>(queryParams.get("cmp"), [
        "eq",
        "lt",
        "lte",
        "gt",
        "gte",
      ]) || "eq",
    chartMode:
      asOrUndefined<ChartMode>(queryParams.get("chart"), ["cdf", "pdf"]) ||
      "pdf",
    numberMode:
      asOrUndefined<NumberMode>(queryParams.get("number"), [
        "fraction",
        "float",
      ]) || "fraction",
    perc: orUndef(parseFloat)(queryParams.get("perc")) || 6,
    prob: orUndef(parseFloat)(queryParams.get("prob")) || 6,
  };
}

function asOrUndefined<T>(value: any, allValues: T[]): T | undefined {
  return allValues.find((e) => e == value) || undefined;
}
