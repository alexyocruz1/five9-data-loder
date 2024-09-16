/**
 * Transforms the response with fields and values into an array of objects.
 * @param {Object} response - The response object containing fields and records.
 * @returns {Array} - An array of objects with field names as keys and corresponding values.
 */
export const transformResponse = (response) => {
  const { data } = response;
  const { fields, records } = data.return;
  return records.map(record => {
    const transformedRecord = {};
    fields.forEach((field, index) => {
      transformedRecord[field] = record.values.data[index];
    });
    return transformedRecord || [];
  });
};

/**
 * Transforms the users info response into an array of objects.
 * @param {Object} response - The response object containing users info.
 * @returns {Array} - An array of user info objects.
 */
export const transformUsersGeneralResponse = (response) => {
  const { data } = response;
  return data?.return || [];
};

/**
 * Transforms the users info response into an array of objects with generalInfo and skills.
 * @param {Object} response - The response object containing users info.
 * @returns {Array} - An array of user info objects with skills.
 */
export const transformUsersWithSkillsResponse = (response) => {
  const { data } = response;
  const users = data?.return || [];

  const transformedUsers = [];

  users.forEach(user => {
    const { generalInfo, skills } = user;
    if (skills && skills.length > 0) {
      skills.forEach(skill => {
        const transformedSkill = {};
        Object.keys(skill).forEach(key => {
          if (!key.toLowerCase().includes('skill')) {
            transformedSkill[`skill${key.charAt(0).toUpperCase() + key.slice(1)}`] = skill[key];
          } else {
            transformedSkill[key] = skill[key];
          }
        });
        transformedUsers.push({
          ...generalInfo,
          ...transformedSkill,
        });
      });
    }
  });

  return transformedUsers;
};

export const roles = {
  admin: {
      permissions: []
  },
  agent: {
    permissions: []
  },
  reporting: {
    permissions: []
  },
  supervisor: {
    permissions: []
  }
};

export const availableRoles = {
  admin: {
    permissions: [
      { type: "ManageLists", label: "Manage Lists", value: false },
      { type: "EditPrompts", label: "Edit Prompts", value: false },
      { type: "ManageUsers", label: "Manage Users", value: false },
      { type: "EditProfiles", label: "Edit Profiles", value: false },
      { type: "EditDispositions", label: "Edit Dispositions", value: false },
      { type: "ManageCampaignsProperties", label: "Manage Campaigns Properties", value: false },
      { type: "ManageDNC", label: "Manage DNC", value: false },
      { type: "EditReasonCodes", label: "Edit Reason Codes", value: false },
      { type: "AccessConfigANI", label: "Access Config ANI", value: false },
      { type: "ManageCampaignsReset", label: "Manage Campaigns Reset", value: false },
      { type: "EditCallAttachedData", label: "Edit Call Attached Data", value: false },
      { type: "ManageCampaignsResetDispositions", label: "Manage Campaigns Reset Dispositions", value: false },
      { type: "NICEEnabled", label: "NICE Enabled", value: false },
      { type: "ManageAgentGroups", label: "Manage Agent Groups", value: false },
      { type: "EditIvr", label: "Edit IVR", value: false },
      { type: "ManageSkills", label: "Manage Skills", value: false },
      { type: "ManageCampaignsResetListPosition", label: "Manage Campaigns Reset List Position", value: false },
      { type: "EditConnectors", label: "Edit Connectors", value: false },
      { type: "FullPermissions", label: "Full Permissions", value: false },
      { type: "EditTrustedIPAddresses", label: "Edit Trusted IP Addresses", value: false },
      { type: "ManageCRM", label: "Manage CRM", value: false },
      { type: "AccessBillingApplication", label: "Access Billing Application", value: false },
      { type: "ManageCampaignsStartStop", label: "Manage Campaigns Start/Stop", value: false },
      { type: "EditWorkflowRules", label: "Edit Workflow Rules", value: false }
    ]
  },
  agent: {
    alwaysRecorded: false,
    attachVmToEmail: false,
    sendEmailOnVm: false,
    permissions: [
      { type: "ReceiveTransfer", label: "Receive Transfer", value: true },
      { type: "MakeRecordings", label: "Make Recordings", value: false },
      { type: "CanRunJavaClient", label: "Can Run Java Client", value: true },
      { type: "SendMessages", label: "Send Messages", value: true },
      { type: "CanRunWebClient", label: "Can Run Web Client", value: false },
      { type: "CreateChatSessions", label: "Create Chat Sessions", value: true },
      { type: "TrainingMode", label: "Training Mode", value: false },
      { type: "CannotRemoveCRM", label: "Cannot Remove CRM", value: true },
      { type: "ProcessVoiceMail", label: "Process Voice Mail", value: true },
      { type: "CallForwarding", label: "Call Forwarding", value: true },
      { type: "CannotEditSession", label: "Cannot Edit Session", value: true },
      { type: "TransferVoiceMail", label: "Transfer Voice Mail", value: false },
      { type: "DeleteVoiceMail", label: "Delete Voice Mail", value: false },
      { type: "AddingToDNC", label: "Adding to DNC", value: true },
      { type: "DialManuallyDNC", label: "Dial Manually DNC", value: false },
      { type: "CreateCallbacks", label: "Create Callbacks", value: true },
      { type: "PlayAudioFiles", label: "Play Audio Files", value: true },
      { type: "CanWrapCall", label: "Can Wrap Call", value: true },
      { type: "CanPlaceCallOnHold", label: "Can Place Call On Hold", value: true },
      { type: "CanParkCall", label: "Can Park Call", value: false },
      { type: "SkipCrmInPreviewDialMode", label: "Skip CRM in Preview Dial Mode", value: false },
      { type: "ManageAvailabilityBySkill", label: "Manage Availability By Skill", value: false },
      { type: "BrowseWebInEmbeddedBrowser", label: "Browse Web In Embedded Browser", value: true },
      { type: "ChangePreviewPreferences", label: "Change Preview Preferences", value: false },
      { type: "CanRejectCalls", label: "Can Reject Calls", value: false },
      { type: "CanConfigureAutoAnswer", label: "Can Configure Auto Answer", value: false },
      { type: "MakeTransferToAgents", label: "Make Transfer To Agents", value: true },
      { type: "MakeTransferToSkills", label: "Make Transfer To Skills", value: true },
      { type: "CreateConferenceWithAgents", label: "Create Conference With Agents", value: true },
      { type: "CreateConferenceWithSkills", label: "Create Conference With Skills", value: true },
      { type: "RecycleDispositionAllowed", label: "Recycle Disposition Allowed", value: true },
      { type: "MakeTransferToInboundCampaigns", label: "Make Transfer To Inbound Campaigns", value: true },
      { type: "MakeTransferToExternalCalls", label: "Make Transfer To External Calls", value: true },
      { type: "CreateConferenceWithInboundCampaigns", label: "Create Conference With Inbound Campaigns", value: true },
      { type: "CreateConferenceWithExternalCalls", label: "Create Conference With External Calls", value: true },
      { type: "MakeCallToSkills", label: "Make Call To Skills", value: true },
      { type: "MakeCallToAgents", label: "Make Call To Agents", value: true },
      { type: "MakeCallToExternalCalls", label: "Make Call To External Calls", value: true },
      { type: "NICEEnabled", label: "NICE Enabled", value: false },
      { type: "ScreenRecording", label: "Screen Recording", value: false }
    ]
  },
  reporting: {
    permissions: [
      { type: "CanAccessRecordingsColumn", label: "Can Access Recordings Column", value: false },
      { type: "CanScheduleReportsViaFtp", label: "Can Schedule Reports Via FTP", value: false },
      { type: "CanViewStandardReports", label: "Can View Standard Reports", value: false },
      { type: "CanViewCustomReports", label: "Can View Custom Reports", value: false },
      { type: "CanViewScheduledReports", label: "Can View Scheduled Reports", value: false },
      { type: "CanViewRecentReports", label: "Can View Recent Reports", value: false },
      { type: "CanViewRelease7Reports", label: "Can View Release 7 Reports", value: false },
      { type: "CanViewCannedReports", label: "Can View Canned Reports", value: false },
      { type: "NICEEnabled", label: "NICE Enabled", value: false }
    ]
  },
  supervisor: {
    permissions: [
      { type: "CampaignManagementStart", label: "Campaign Management Start", value: false },
      { type: "CampaignManagementStop", label: "Campaign Management Stop", value: false },
      { type: "CampaignManagementReset", label: "Campaign Management Reset", value: false },
      { type: "CampaignManagementResetDispositions", label: "Campaign Management Reset Dispositions", value: false },
      { type: "CampaignManagementResetListPositions", label: "Campaign Management Reset List Positions", value: false },
      { type: "CampaignManagementResetAbandonCallRate", label: "Campaign Management Reset Abandon Call Rate", value: false },
      { type: "CanViewTextDetailsTab", label: "Can View Text Details Tab", value: false },
      { type: "Users", label: "Users", value: false },
      { type: "Agents", label: "Agents", value: false },
      { type: "Stations", label: "Stations", value: false },
      { type: "ChatSessions", label: "Chat Sessions", value: false },
      { type: "Campaigns", label: "Campaigns", value: false },
      { type: "CanAccessDashboardMenu", label: "Can Access Dashboard Menu", value: false },
      { type: "CallMonitoring", label: "Call Monitoring", value: false },
      { type: "CampaignManagement", label: "Campaign Management", value: false },
      { type: "AllSkills", label: "All Skills", value: false },
      { type: "BillingInfo", label: "Billing Info", value: false },
      { type: "BargeInMonitor", label: "Barge In Monitor", value: false },
      { type: "WhisperMonitor", label: "Whisper Monitor", value: false },
      { type: "ViewDataForAllAgentGroups", label: "View Data For All Agent Groups", value: false },
      { type: "ReviewVoiceRecordings", label: "Review Voice Recordings", value: false },
      { type: "EditAgentSkills", label: "Edit Agent Skills", value: false },
      { type: "CanAccessShowFields", label: "Can Access Show Fields", value: false },
      { type: "NICEEnabled", label: "NICE Enabled", value: false }
    ]
  }
};

export const getRoles = () => {
  return availableRoles;
};