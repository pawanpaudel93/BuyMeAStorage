import "@/components/ArProfile/Profile.module.css";
import SupportPage from "@/components/Support/SupportPage";
import { SUPPORT_ADDRESS } from "@/utils/constants";

export default function Support() {
  return <SupportPage address={SUPPORT_ADDRESS} />;
}
