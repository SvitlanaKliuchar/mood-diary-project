import HomeIconUrl from '../assets/icons/home.svg';
import StatsIconUrl from '../assets/icons/chart.svg';
import CalendarIconUrl from '../assets/icons/calendar.svg';
import SettingsIconUrl from '../assets/icons/settings.svg';
import LogInIconUrl from '../assets/icons/log-in.svg';

const navLinks = [
    { to: '/home', label: 'Home', iconUrl: HomeIconUrl },
    { to: '/stats', label: 'Stats', iconUrl: StatsIconUrl },
    { to: '/calendar', label: 'Calendar', iconUrl: CalendarIconUrl },
    { to: '/settings', label: 'Settings', iconUrl: SettingsIconUrl },
    { to: '/login', label: 'Log in', iconUrl: LogInIconUrl },
];

export default navLinks;
