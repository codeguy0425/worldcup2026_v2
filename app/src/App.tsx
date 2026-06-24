import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './themes/ThemeProvider'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import {
  SchedulePage, MatchPage, TeamsPage, TeamPage,
  GroupsPage, GroupPage, ThirdPlacedPage, ScorersPage,
  BracketPage, StadiumsPage, NotFoundPage,
} from './pages'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/team/:id" element={<TeamPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupPage />} />
            <Route path="/third-placed" element={<ThirdPlacedPage />} />
            <Route path="/scorers" element={<ScorersPage />} />
            <Route path="/bracket" element={<BracketPage />} />
            <Route path="/stadiums" element={<StadiumsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  )
}
