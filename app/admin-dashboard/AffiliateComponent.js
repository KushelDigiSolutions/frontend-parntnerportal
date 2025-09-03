"use client";

import ProtectedRoute from "../COMMON/ProtectedRoute";
import AffiliateDash from "./AffiliateDash";

export default function AffiliateComponent() {
  return (
    <ProtectedRoute>
      <main>
        <AffiliateDash />
      </main>
    </ProtectedRoute>
  );
}
