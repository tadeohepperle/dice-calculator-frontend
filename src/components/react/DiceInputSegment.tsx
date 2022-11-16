import IconButton from "./IconButton";
import IconButtonWithNumber from "./IconButtonWithNumber";
import InputField from "./InputField";
import { Icons, UIColor } from "./ui";

const DiceInputSegment = () => {
  return (
    <div>
      <div>
        <InputField placeholder="2d6" onChange={() => {}}></InputField>
      </div>
      <div className="flex mt-5">
        <IconButton
          uiColor={UIColor.Primary}
          title="Calculate Distribution"
          onClick={() => {}}
          icon={Icons.calculator}
        ></IconButton>
        <div className="mr-5"></div>
        <IconButton
          uiColor={UIColor.Primary}
          title="Roll"
          onClick={() => {}}
          icon={Icons.d20}
        ></IconButton>
        <div className="mr-5"></div>
        <IconButtonWithNumber
          number={100}
          uiColor={UIColor.Primary}
          title="Roll"
          onClick={() => {}}
          icon={Icons.d20}
        ></IconButtonWithNumber>
      </div>
    </div>
  );
};

export default DiceInputSegment;
