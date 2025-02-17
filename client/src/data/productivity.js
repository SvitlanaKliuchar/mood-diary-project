import BreakIconUrl from "../assets/icons/productivity/break.svg";
import FocusIconUrl from "../assets/icons/productivity/focus.svg";
import MakeListIconUrl from "../assets/icons/productivity/make-list.svg";
import StartEarlyIconUrl from "../assets/icons/productivity/start-early.svg";

const productivityOptions = [
  { value: "good focus", label: "Good Focus", iconUrl: FocusIconUrl },
  { value: "bad focus", label: "Bad Focus", iconUrl: FocusIconUrl },
  { value: "start early", label: "Start Early", iconUrl: StartEarlyIconUrl },
  { value: "delay", label: "Delay", iconUrl: StartEarlyIconUrl },
  { value: "make a list", label: "Make List", iconUrl: MakeListIconUrl },
  { value: "take a break", label: "Break", iconUrl: BreakIconUrl },
];

export default productivityOptions;
