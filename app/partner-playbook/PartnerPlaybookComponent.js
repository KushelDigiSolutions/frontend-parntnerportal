"use client"

import GrowBusiness from "./GrowBanner/page";
import PartnerPlaybook from "./PartnerBanner/Playbook";
import PartnerDashboard from "./PartnerSec2/page";


export default function PartnerPlaybookComponent() {
    return (
        <>
            <main>
                {/* <h1>Hello</h1> */}
                <PartnerPlaybook/>
                <PartnerDashboard/>
                <GrowBusiness/>
            </main>
        </>
    );
}

