import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

function TeamCalendar() {
  const [date, setDate] = useState(new Date());

  const onChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div>
      <Calendar
        onChange={onChange}
        value={date}
      />
    </div>
  );
}

export default TeamCalendar;