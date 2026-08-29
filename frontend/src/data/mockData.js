export const mockUsers = [
  {
    id: "USR-001",
    name: "Security Officer",
    role: "officer",
    status: "Online",
  }
];

export const mockIdentities = [
  {
    id: "ID-2024-001",
    name: "Arjun Rao",
    dob: "2002-04-12",
    nationality: "Indian",
    status: "Previously Verified",
    verificationDate: "2024-05-10",
  }
];

export const mockScreenings = [
  {
    id: "SCR-2026-08124",
    personName: "Arjun Rao",
    documentType: "Passport",
    date: "29 Aug 2026",
    riskLevel: "Low",
    riskScore: 12,
    status: "Cleared"
  },
  {
    id: "SCR-2026-08123",
    personName: "Rahul Mehta",
    documentType: "Passport + Visa",
    date: "29 Aug 2026",
    riskLevel: "High",
    riskScore: 82,
    status: "Review Required"
  },
  {
    id: "SCR-2026-08122",
    personName: "Priya Sharma",
    documentType: "Passport",
    date: "29 Aug 2026",
    riskLevel: "Medium",
    riskScore: 45,
    status: "Additional Verification"
  },
  {
    id: "SCR-2026-08121",
    personName: "John Doe",
    documentType: "Passport",
    date: "28 Aug 2026",
    riskLevel: "Low",
    riskScore: 5,
    status: "Cleared"
  },
  {
    id: "SCR-2026-08120",
    personName: "Jane Smith",
    documentType: "National ID",
    date: "28 Aug 2026",
    riskLevel: "Low",
    riskScore: 8,
    status: "Cleared"
  }
];

export const mockScreeningDetails = {
  "SCR-2026-08124": {
    id: "SCR-2026-08124",
    personName: "Arjun Rao",
    status: "Analysis Complete",
    riskScore: 72,
    riskLevel: "High",
    recommendation: "Additional verification required",
    documents: [
      { type: "Passport", status: "Analyzed" },
      { type: "Visa", status: "Analyzed" }
    ],
    ocr: {
      name: "Arjun Rao",
      dob: "12 Apr 2002",
      nationality: "Indian",
      passportNumber: "P1234567",
      expiry: "12 Apr 2030"
    },
    validation: [
      { text: "Field format valid", status: "pass" },
      { text: "Expiry valid", status: "pass" },
      { text: "DOB mismatch with historical record", status: "warn" }
    ],
    tampering: {
      overall: "Medium",
      photo: "Low",
      text: "High",
      stamp: "Low",
      metadata: "Medium"
    },
    faceMatch: {
      score: 96,
      status: "MATCH"
    },
    history: [
      { year: "2024", title: "Initial verification", details: "Name: Arjun Rao\nDOB: 12 Apr 2002" },
      { year: "2025", title: "Verification", details: "Name: Arjun Rao\nDOB: 12 Apr 2002" },
      { year: "2026", title: "Current screening", details: "Name: Arjun Rao\nDOB: 12 Apr 2001", highlight: true }
    ],
    relationships: {
      current: "Arjun Rao",
      links: [
        { from: "Arjun Rao", relation: "Mother", to: "Meena Rao" },
        { from: "Meena Rao", relation: "Son", to: "Rahul Rao", conflict: true }
      ],
      status: "⚠ Relationship inconsistency",
      explanation: "Relationship claims between linked identity records are inconsistent."
    },
    intelligence: {
      confidence: 89,
      contributions: [
        { label: "Document Validation", value: "+12" },
        { label: "Tampering Signals", value: "+21" },
        { label: "Face Verification", value: "-18" },
        { label: "Identity History", value: "+15" },
        { label: "Relationship Analysis", value: "+20" }
      ]
    },
    evidence: [
      { title: "DOB mismatch", severity: "High", description: "Passport DOB differs from previous verified record.", confidence: 94 },
      { title: "Relationship inconsistency", severity: "High", description: "Relationship information conflicts with another identity record.", confidence: 88 },
      { title: "Possible document manipulation", severity: "Medium", description: "Text region shows signs requiring further review.", confidence: 75 },
      { title: "Face match", severity: "Low", description: "Document photograph is consistent with presented person.", confidence: 96 }
    ]
  },
  "demo-001": {
    id: "demo-001",
    personName: "Arjun Rao",
    status: "Additional verification required",
    riskScore: 72,
    riskLevel: "High",
    recommendation: "Additional verification required",
    documents: [
      { type: "Passport", status: "Analyzed" },
      { type: "Visa", status: "Analyzed" }
    ],
    ocr: {
      name: "Arjun Rao",
      dob: "12 Apr 2001",
      nationality: "Indian",
      passportNumber: "P1234567",
      expiry: "12 Apr 2030"
    },
    validation: [
      { text: "Field format valid", status: "pass" },
      { text: "Expiry valid", status: "pass" },
      { text: "DOB mismatch with historical record", status: "warn" }
    ],
    tampering: {
      overall: "Medium",
      photo: "Low",
      text: "High",
      stamp: "Low",
      metadata: "Medium"
    },
    faceMatch: {
      score: 96,
      status: "MATCH"
    },
    history: [
      { year: "2024", title: "Initial verification", details: "Name: Arjun Rao\nDOB: 12 Apr 2002" },
      { year: "2025", title: "Verification", details: "Name: Arjun Rao\nDOB: 12 Apr 2002" },
      { year: "2026", title: "Current screening", details: "Name: Arjun Rao\nDOB: 12 Apr 2001", highlight: true }
    ],
    relationships: {
      current: "Arjun Rao",
      links: [
        { from: "Arjun Rao", relation: "Mother", to: "Meena Rao" },
        { from: "Meena Rao", relation: "Son", to: "Rahul Rao", conflict: true }
      ],
      status: "⚠ Relationship inconsistency",
      explanation: "Relationship claims between linked identity records are inconsistent."
    },
    intelligence: {
      confidence: 89,
      contributions: [
        { label: "Document Validation", value: "+12" },
        { label: "Tampering Signals", value: "+21" },
        { label: "Face Verification", value: "-18" },
        { label: "Identity History", value: "+15" },
        { label: "Relationship Analysis", value: "+20" }
      ]
    },
    evidence: [
      { title: "DOB mismatch", severity: "High", description: "Passport DOB differs from previous verified record.", confidence: 94 },
      { title: "Relationship inconsistency", severity: "High", description: "Relationship information conflicts with another identity record.", confidence: 88 },
      { title: "Possible document manipulation", severity: "Medium", description: "Text region shows signs requiring further review.", confidence: 75 },
      { title: "Face match", severity: "Low", description: "Document photograph is consistent with presented person.", confidence: 96 }
    ]
  }
};
