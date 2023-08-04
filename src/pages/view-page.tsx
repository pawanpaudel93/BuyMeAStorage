import "@/components/ArProfile/Profile.module.css";
import SupportPage from "@/components/Support/SupportPage";
import { useActiveAddress } from "arweave-wallet-kit";

export default function Support() {
  const activeAddress = useActiveAddress();
  return <SupportPage address={activeAddress} />;
}
