import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment'; 
import { QUERY_TASKS } from '../../utils/queries';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const MyCalendarTasks = () => {
  const { loading, error, data } = useQuery(QUERY_TASKS);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!loading && data && data.tasks) {
      const formattedEvents = data.tasks.map(task => {
        const dueDate = moment(task.dateDue, "MMM D, YYYY"); 

        if (dueDate.isValid()) {
          return {
            id: task._id,
            title: task.description,
            start: dueDate.toDate(), 
            end: dueDate.toDate(), 
          };
        } else {
          console.error('Invalid date format:', task.dateDue);
          return null;
        }
      }).filter(event => event !== null);

      setEvents(formattedEvents);
    }
  }, [loading, data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data...</p>;

  const customLocalizer = momentLocalizer(moment);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Calendar
        events={events}
        startAccessor="start"
        endAccessor="end"
        localizer={customLocalizer}
        style={{ minHeight: '400px', height: '100%', width: '100%' }}
        eventPropGetter={() => ({
          style: {
            height: '100%' // Ensure each event block has full height
          }
        })}
      />
    </div>
  );
};

export default MyCalendarTasks;