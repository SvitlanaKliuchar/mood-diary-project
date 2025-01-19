import HomeIconUrl from "../assets/icons/menu/home.svg";
import StatsIconUrl from "../assets/icons/menu/chart.svg";
import CalendarIconUrl from "../assets/icons/menu/calendar.svg";
import SettingsIconUrl from "../assets/icons/menu/settings.svg";
import LogInIconUrl from "../assets/icons/menu/log-in.svg";

const navLinks = [
  { to: "/home", label: "Home", iconUrl: HomeIconUrl },
  { to: "/stats", label: "Stats", iconUrl: StatsIconUrl },
  { to: "/calendar", label: "Calendar", iconUrl: CalendarIconUrl },
  { to: "/settings", label: "Settings", iconUrl: SettingsIconUrl },
  { to: "/login", label: "Log in", iconUrl: LogInIconUrl },
];

export default navLinks;
