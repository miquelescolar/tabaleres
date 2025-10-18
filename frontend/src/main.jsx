import { useEffect, useState } from "react";
import { getEvents, getStudents, getAttendance, postAttendance } from "./api";
import { CSVLink } from "react-csv";

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filterType, setFilterType] = useState("Todos");

  useEffect(() => {
    fetchEvents();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedEvent) fetchAttendance(selectedEvent.id);
  }, [selectedEvent]);

  const fetchEvents = async () => {
    const res = await getEvents();
    setEvents(res.data);
    if (res.data.length) setSelectedEvent(res.data[0]);
  };

  const fetchStudents = async () => {
    const res = await getStudents();
    setStudents(res.data);
  };

  const fetchAttendance = async (eventId) => {
    const res = await getAttendance(eventId);
    setAttendance(res.data);
  };

  const handleStatusChange = async (studentId, status) => {
    if (!selectedEvent) return;
    await postAttendance({ student_id: studentId, event_id: selectedEvent.id, status });
    fetchAttendance(selectedEvent.id);
  };

  const filteredEvents = filterType === "Todos" ? events : events.filter(e => e.type === filterType);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Asistencia Ensayos/Bolos</h1>

      <div>
        <label>Filtrar por tipo: </label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option>Todos</option>
          <option>Ensayo</option>
          <option>Bolo</option>
        </select>
      </div>

      <div>
        <label>Selecciona evento: </label>
        <select onChange={e => setSelectedEvent(filteredEvents.find(ev => ev.id == e.target.value))}>
          {filteredEvents.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.name} ({ev.type}) - {ev.date}</option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Asistencia - {selectedEvent.name}</h2>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const att = attendance.find(a => a.student === s.name);
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <select value={att?.status || ""} onChange={e => handleStatusChange(s.id, e.target.value)}>
                        <option value="">---</option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                        <option value="Justificado">Justificado</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: "1rem" }}>
            <CSVLink data={attendance} filename={`asistencia_${selectedEvent.name}.csv`}>
              Descargar historial CSV
            </CSVLink>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
