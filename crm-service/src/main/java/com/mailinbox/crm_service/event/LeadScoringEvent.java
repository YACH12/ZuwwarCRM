package com.mailinbox.crm_service.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeadScoringEvent {

    @JsonProperty("contactId")
    private Long contactId;

    @JsonProperty("email")
    private String email;

    // ✅ Double (objet) au lieu de double (primitif) — supporte null
    @JsonProperty("total_time_spent")
    private Double totalTimeSpent    = 0.0;

    @JsonProperty("page_views_per_visit")
    private Double pageViewsPerVisit = 0.0;

    @JsonProperty("total_visits")
    private Double totalVisits       = 1.0;

    @JsonProperty("lead_source")
    private String leadSource        = "Google";

    @JsonProperty("lead_origin")
    private String leadOrigin        = "Landing Page Submission";

    @JsonProperty("last_activity")
    private String lastActivity      = "Email Opened";

    @JsonProperty("occupation")
    private String occupation        = "unknown";
}