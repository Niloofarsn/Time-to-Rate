import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/Login/LoginPage";
import { StudiesPage } from "./pages/Studies/StudiesPage";
import { StudyDashboard } from "./pages/StudyDashboard/StudyDashboard";
import { ParticipantDetails } from "./pages/ParticipantDetails/ParticipantDetails";
import { WizardLayout } from "./pages/Wizard/WizardLayout";
import { StepDettagli } from "./pages/Wizard/steps/StepDettagli";
import { StepPianificazioni } from "./pages/Wizard/steps/StepPianificazioni";
import { StepNotifiche } from "./pages/Wizard/steps/StepNotifiche";
import { StepConsenso } from "./pages/Wizard/steps/StepConsenso";
import { StepIstruzioni } from "./pages/Wizard/steps/StepIstruzioni";
import { StepRiepilogo } from "./pages/Wizard/steps/StepRiepilogo";
import { StepAttivazione } from "./pages/Wizard/steps/StepAttivazione";
import { SimplePage } from "./pages/Stubs/SimplePage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/studi" replace />} />
        <Route path="/studi" element={<StudiesPage />} />
        <Route path="/studi/:id" element={<StudyDashboard />} />
        <Route path="/studi/:id/partecipanti/:pid" element={<ParticipantDetails />} />

        <Route path="/studi/:id/crea" element={<WizardLayout />}>
          <Route index element={<Navigate to="dettagli" replace />} />
          <Route path="dettagli" element={<StepDettagli />} />
          <Route path="pianificazioni" element={<StepPianificazioni />} />
          <Route path="notifiche" element={<StepNotifiche />} />
          <Route path="consenso" element={<StepConsenso />} />
          <Route path="istruzioni" element={<StepIstruzioni />} />
          <Route path="riepilogo" element={<StepRiepilogo />} />
          <Route path="attivazione" element={<StepAttivazione />} />
        </Route>

        <Route path="/profilo" element={<SimplePage title="Profilo" icon="person" />} />
        <Route path="/guida" element={<SimplePage title="Guida" icon="question-circle" />} />
        <Route path="/avvisi" element={<SimplePage title="Avvisi" icon="bell" />} />
      </Route>

      <Route path="*" element={<Navigate to="/studi" replace />} />
    </Routes>
  );
}
