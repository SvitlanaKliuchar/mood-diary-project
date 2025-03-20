import GreatIconUrl from "../assets/icons/moods/great.svg";
import GoodIconUrl from "../assets/icons/moods/good.svg";
import MehIconUrl from "../assets/icons/moods/meh.svg";
import BadIconUrl from "../assets/icons/moods/bad.svg";
import AwfulIconUrl from "../assets/icons/moods/awful.svg";

const moods = [
  { value: "great", label: "Great", iconUrl: GreatIconUrl, color: "#6EC6FF", number: 5},
  { value: "good", label: "Good", iconUrl: GoodIconUrl, color: "#58D68D", number: 4},
  { value: "meh", label: "Meh", iconUrl: MehIconUrl, color: "#D5D8DC", number: 3},
  { value: "bad", label: "Bad", iconUrl: BadIconUrl, color:  "#E59866", number: 2},
  { value: "awful", label: "Awful", iconUrl: AwfulIconUrl, color: "#D9534F", number: 1},
];

export default moods;

