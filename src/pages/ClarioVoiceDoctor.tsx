import { AppLayout } from "@/components/layout/AppLayout";
import AudioUploadCard from "@/components/AudioUploadCard";
import VoiceDashboard from "@/components/VoiceDashboard";
import VoiceDoctorChat from "@/components/VoiceDoctorChat";

export default function ClarioVoiceDoctor() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Upload → analyze → save metrics/streak/credits */}
        <AudioUploadCard />

        {/* Cards + charts + history */}
        <VoiceDashboard />

        {/* Claude-only, guard-railed chat using latest report + history */}
        <VoiceDoctorChat />
      </div>
    </AppLayout>
  );
}
