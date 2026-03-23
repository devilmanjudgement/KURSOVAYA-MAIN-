import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Section from './Section';
import BookingConfirm from './BookingConfirm';
import Success from './Success';
import Profile from './Profile';
import Schedule from './Schedule';
import ScheduleEdit from './ScheduleEdit';
import SearchPage from './SearchPage';
import SectionsList from './SectionsList';
import Chat from './Chat';
import AdminPanel from './AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/section/:id" element={<Section />} />
        <Route path="/confirm/:id" element={<BookingConfirm />} />
        <Route path="/success" element={<Success />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/schedule/edit" element={<ScheduleEdit />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/sections" element={<SectionsList />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
