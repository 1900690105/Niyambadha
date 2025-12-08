import React, { Suspense } from "react";
import CyberPuzzlePortal from "./components/CyberPuzzlePortal";

const page = () => {
  return (
    <div>
      <Suspense>
        <CyberPuzzlePortal />
      </Suspense>
    </div>
  );
};

export default page;
