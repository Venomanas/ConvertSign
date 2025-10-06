import SignatureCanvas from "@/components/SignatureCanvas";
import DownloadSignature from "@/components/DownloadSignature";

export default function SignaturePage() {
  return (
    <div>
      <SignatureCanvas />
      <DownloadSignature />
    </div>
  );
}
