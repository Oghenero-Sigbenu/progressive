"use client";

import { Layout } from "../../Components";
import { AydGallery, ProgrammeDownload } from "../../Components/Ayd";
import AYDModal from "../../Components/Modals/AydModal";

function AYD() {
  return (
    <Layout>
      <AYDModal />
      <ProgrammeDownload />
      <AydGallery />
    </Layout>
  );
}

export default AYD;
