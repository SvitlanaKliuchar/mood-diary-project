import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isToday } from 'date-fns';
import styles from './DatePickerComponent.module.css'; 

const DatePickerComponent = ({ selectedDate, onDateChange }) => {
  const today = isToday(selectedDate)
  const formattedDate = today 
  ? `Today, ${format(selectedDate, 'dd MMM')}`
  :  format(selectedDate, 'EEEE, dd MMM')

  return (
    <div className={styles['date-picker-container']}>
      <DatePicker
        selected={selectedDate}
        onChange={onDateChange}
        dateFormat="EEEE, dd MMM"
        className={styles.date}
        aria-label="Select date"
        customInput={<CustomInput formattedDate={formattedDate} />}
      />
    </div>
  );
};

//custom input component to display the formatted date
const CustomInput = React.forwardRef(({ value, onClick, formattedDate }, ref) => (
  <span
    onClick={onClick}
    ref={ref}
    className={styles['custom-input']}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick();
      }
    }}
    aria-label="Change date"
  >
    {formattedDate}
  </span>
));


export default DatePickerComponent;
