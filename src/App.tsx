import DistributionCalculatorWrapper from "./components/react/DistributionCalculatorWrapper";
import ExamplesSidebar from "./components/react/ExamplesSidebar";
import HeaderPanel from "./components/react/HeaderPanel";
import LearnMoreHeader from "./components/react/LearnMoreHeader";

const App = () => {
  return (
    <>
      <HeaderPanel />
      <div className="md:flex">
        <div className="mt-5">
          <ExamplesSidebar />
        </div>

        <div className="flex-grow mt-5">
          <div className="max-w-4xl p-3">
            <LearnMoreHeader />
            <div className="mt-5">
              <DistributionCalculatorWrapper />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
