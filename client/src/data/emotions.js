import AngryIconUrl from "../assets/icons/emotions/angry.svg";
import AnxiousIconUrl from "../assets/icons/emotions/anxious.svg";
import BoredIconUrl from "../assets/icons/emotions/bored.svg";
import ContentIconUrl from "../assets/icons/emotions/content.svg";
import ExcitedIconUrl from "../assets/icons/emotions/excited.svg";
import GratefulIconUrl from "../assets/icons/emotions/grateful.svg";
import HappyIconUrl from "../assets/icons/emotions/happy.svg";
import RelaxedIconUrl from "../assets/icons/emotions/relaxed.svg";
import SadIconUrl from "../assets/icons/emotions/sad.svg";
import StressedIconUrl from "../assets/icons/emotions/stressed.svg";
import TiredIconUrl from "../assets/icons/emotions/tired.svg";
import UnsureIconUrl from "../assets/icons/emotions/unsure.svg";

const emotionsOptions = [
  { value: "happy", label: "Happy", iconUrl: HappyIconUrl },
  { value: "excited", label: "Excited", iconUrl: ExcitedIconUrl },
  { value: "grateful", label: "Grateful", iconUrl: GratefulIconUrl },
  { value: "content", label: "Content", iconUrl: ContentIconUrl },
  { value: "relaxed", label: "Relaxed", iconUrl: RelaxedIconUrl },
  { value: "bored", label: "Bored", iconUrl: BoredIconUrl },
  { value: "unsure", label: "Unsure", iconUrl: UnsureIconUrl },
  { value: "tired", label: "Tired", iconUrl: TiredIconUrl },
  { value: "sad", label: "Sad", iconUrl: SadIconUrl },
  { value: "stressed", label: "Stressed", iconUrl: StressedIconUrl },
  { value: "angry", label: "Angry", iconUrl: AngryIconUrl },
  { value: "anxious", label: "Anxious", iconUrl: AnxiousIconUrl },
];

export default emotionsOptions;
