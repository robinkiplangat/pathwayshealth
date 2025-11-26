// Dummy questions for UI testing
// This file provides sample data matching the structure expected by the assessment page

export const DUMMY_QUESTIONS = [
    // FLOOD - WORKFORCE
    {
        id: "flood-workforce-1",
        text: "Does your facility have an emergency evacuation plan for flooding events?",
        hazard: "FLOOD",
        pillar: "WORKFORCE",
        isCritical: true,
        weight: 2
    },
    {
        id: "flood-workforce-2",
        text: "Are staff trained on flood response procedures and safety protocols?",
        hazard: "FLOOD",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },
    {
        id: "flood-workforce-3",
        text: "Is there a communication system in place to alert staff during flood warnings?",
        hazard: "FLOOD",
        pillar: "WORKFORCE",
        isCritical: true,
        weight: 2
    },

    // FLOOD - WASH
    {
        id: "flood-wash-1",
        text: "Are water sources protected from flood contamination?",
        hazard: "FLOOD",
        pillar: "WASH",
        isCritical: true,
        weight: 2
    },
    {
        id: "flood-wash-2",
        text: "Does the facility have backup water storage for flood events?",
        hazard: "FLOOD",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },
    {
        id: "flood-wash-3",
        text: "Are sanitation systems designed to prevent overflow during flooding?",
        hazard: "FLOOD",
        pillar: "WASH",
        isCritical: true,
        weight: 2
    },

    // FLOOD - ENERGY
    {
        id: "flood-energy-1",
        text: "Are electrical systems elevated above potential flood levels?",
        hazard: "FLOOD",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "flood-energy-2",
        text: "Does the facility have backup power generation for flood scenarios?",
        hazard: "FLOOD",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "flood-energy-3",
        text: "Are fuel storage areas protected from flood damage?",
        hazard: "FLOOD",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },

    // FLOOD - INFRASTRUCTURE
    {
        id: "flood-infrastructure-1",
        text: "Is the facility built above the 100-year flood plain?",
        hazard: "FLOOD",
        pillar: "INFRASTRUCTURE",
        isCritical: true,
        weight: 2
    },
    {
        id: "flood-infrastructure-2",
        text: "Are there flood barriers or drainage systems in place?",
        hazard: "FLOOD",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },
    {
        id: "flood-infrastructure-3",
        text: "Are critical medical equipment and supplies stored in flood-safe areas?",
        hazard: "FLOOD",
        pillar: "INFRASTRUCTURE",
        isCritical: true,
        weight: 2
    },

    // STORM - WORKFORCE
    {
        id: "storm-workforce-1",
        text: "Are staff trained on severe weather safety protocols?",
        hazard: "STORM",
        pillar: "WORKFORCE",
        isCritical: true,
        weight: 2
    },
    {
        id: "storm-workforce-2",
        text: "Does the facility have a shelter-in-place plan for storms?",
        hazard: "STORM",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },
    {
        id: "storm-workforce-3",
        text: "Is there adequate staffing coverage during severe weather events?",
        hazard: "STORM",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },

    // STORM - WASH
    {
        id: "storm-wash-1",
        text: "Are water storage tanks secured against high winds?",
        hazard: "STORM",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },
    {
        id: "storm-wash-2",
        text: "Does the facility have emergency water reserves for storm disruptions?",
        hazard: "STORM",
        pillar: "WASH",
        isCritical: true,
        weight: 2
    },
    {
        id: "storm-wash-3",
        text: "Are wastewater systems designed to handle storm surge?",
        hazard: "STORM",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },

    // STORM - ENERGY
    {
        id: "storm-energy-1",
        text: "Is the facility's power infrastructure protected from wind damage?",
        hazard: "STORM",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "storm-energy-2",
        text: "Are backup generators tested regularly for storm readiness?",
        hazard: "STORM",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "storm-energy-3",
        text: "Does the facility have fuel reserves for extended power outages?",
        hazard: "STORM",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },

    // STORM - INFRASTRUCTURE
    {
        id: "storm-infrastructure-1",
        text: "Is the building structure rated for high wind speeds?",
        hazard: "STORM",
        pillar: "INFRASTRUCTURE",
        isCritical: true,
        weight: 2
    },
    {
        id: "storm-infrastructure-2",
        text: "Are windows and doors reinforced against storm damage?",
        hazard: "STORM",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },
    {
        id: "storm-infrastructure-3",
        text: "Is the roof regularly inspected and maintained for storm resilience?",
        hazard: "STORM",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },

    // HEATWAVE - WORKFORCE
    {
        id: "heatwave-workforce-1",
        text: "Are staff trained to recognize and respond to heat-related illnesses?",
        hazard: "HEATWAVE",
        pillar: "WORKFORCE",
        isCritical: true,
        weight: 2
    },
    {
        id: "heatwave-workforce-2",
        text: "Does the facility provide adequate hydration stations for staff?",
        hazard: "HEATWAVE",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },
    {
        id: "heatwave-workforce-3",
        text: "Are work schedules adjusted during extreme heat events?",
        hazard: "HEATWAVE",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },

    // HEATWAVE - WASH
    {
        id: "heatwave-wash-1",
        text: "Does the facility have sufficient water supply during heat waves?",
        hazard: "HEATWAVE",
        pillar: "WASH",
        isCritical: true,
        weight: 2
    },
    {
        id: "heatwave-wash-2",
        text: "Are cooling stations available for patients and staff?",
        hazard: "HEATWAVE",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },
    {
        id: "heatwave-wash-3",
        text: "Is water quality monitored during periods of high temperature?",
        hazard: "HEATWAVE",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },

    // HEATWAVE - ENERGY
    {
        id: "heatwave-energy-1",
        text: "Can the facility's cooling systems handle extended heat waves?",
        hazard: "HEATWAVE",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "heatwave-energy-2",
        text: "Is there backup power for critical cooling systems?",
        hazard: "HEATWAVE",
        pillar: "ENERGY",
        isCritical: true,
        weight: 2
    },
    {
        id: "heatwave-energy-3",
        text: "Are HVAC systems regularly maintained for peak performance?",
        hazard: "HEATWAVE",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },

    // HEATWAVE - INFRASTRUCTURE
    {
        id: "heatwave-infrastructure-1",
        text: "Is the building designed with heat mitigation features (insulation, reflective roofing)?",
        hazard: "HEATWAVE",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },
    {
        id: "heatwave-infrastructure-2",
        text: "Are temperature-sensitive medications and supplies stored in climate-controlled areas?",
        hazard: "HEATWAVE",
        pillar: "INFRASTRUCTURE",
        isCritical: true,
        weight: 2
    },
    {
        id: "heatwave-infrastructure-3",
        text: "Does the facility have adequate ventilation for extreme heat?",
        hazard: "HEATWAVE",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },

    // DROUGHT - WORKFORCE
    {
        id: "drought-workforce-1",
        text: "Are staff trained on water conservation protocols?",
        hazard: "DROUGHT",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },
    {
        id: "drought-workforce-2",
        text: "Is there a plan for maintaining operations during water shortages?",
        hazard: "DROUGHT",
        pillar: "WORKFORCE",
        isCritical: true,
        weight: 2
    },
    {
        id: "drought-workforce-3",
        text: "Are alternative water sources identified for emergency use?",
        hazard: "DROUGHT",
        pillar: "WORKFORCE",
        isCritical: false,
        weight: 1
    },

    // DROUGHT - WASH
    {
        id: "drought-wash-1",
        text: "Does the facility have water storage capacity for drought periods?",
        hazard: "DROUGHT",
        pillar: "WASH",
        isCritical: true,
        weight: 2
    },
    {
        id: "drought-wash-2",
        text: "Are water-efficient fixtures installed throughout the facility?",
        hazard: "DROUGHT",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },
    {
        id: "drought-wash-3",
        text: "Is there a water recycling or rainwater harvesting system?",
        hazard: "DROUGHT",
        pillar: "WASH",
        isCritical: false,
        weight: 1
    },

    // DROUGHT - ENERGY
    {
        id: "drought-energy-1",
        text: "Are cooling systems designed to operate with minimal water usage?",
        hazard: "DROUGHT",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },
    {
        id: "drought-energy-2",
        text: "Does the facility have alternative energy sources that don't rely on water?",
        hazard: "DROUGHT",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },
    {
        id: "drought-energy-3",
        text: "Is there monitoring of water-dependent energy systems?",
        hazard: "DROUGHT",
        pillar: "ENERGY",
        isCritical: false,
        weight: 1
    },

    // DROUGHT - INFRASTRUCTURE
    {
        id: "drought-infrastructure-1",
        text: "Are landscaping and grounds designed for drought tolerance?",
        hazard: "DROUGHT",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },
    {
        id: "drought-infrastructure-2",
        text: "Is there infrastructure for connecting to alternative water sources?",
        hazard: "DROUGHT",
        pillar: "INFRASTRUCTURE",
        isCritical: true,
        weight: 2
    },
    {
        id: "drought-infrastructure-3",
        text: "Are water distribution systems monitored for leaks and efficiency?",
        hazard: "DROUGHT",
        pillar: "INFRASTRUCTURE",
        isCritical: false,
        weight: 1
    },
];

// Helper function to get questions by hazard and pillar
export function getQuestionsByHazardAndPillar(hazard: string, pillar: string) {
    return DUMMY_QUESTIONS.filter(q => q.hazard === hazard && q.pillar === pillar);
}

// Helper function to get all questions for a hazard
export function getQuestionsByHazard(hazard: string) {
    return DUMMY_QUESTIONS.filter(q => q.hazard === hazard);
}

// Helper function to get all questions for a pillar
export function getQuestionsByPillar(pillar: string) {
    return DUMMY_QUESTIONS.filter(q => q.pillar === pillar);
}
