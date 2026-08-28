import uuid
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User, State, District, RoleChoices
from apps.cases.models import (
    Case, Subject, CaseMilestone, CaseEvent,
    CaseStageChoices, CaseTypeChoices, RiskLevelChoices, PriorityChoices
)
from apps.interactions.models import Interaction, InteractionChannelChoices, ProcessingStatusChoices
from apps.risk.models import LongitudinalMetric, ContributingFactorItem, PersonalBaseline
from apps.alerts.models import Alert, AlertStatusChoices, AlertTimelineEvent
from apps.interventions.models import Intervention, InterventionTypeChoices, InterventionStatusChoices
from apps.integrations.models import DepartmentIntegration, IntegrationEvent, DepartmentCodeChoices
from apps.audit.models import AuditLog

class Command(BaseCommand):
    help = 'Seeds complete demonstration data matching the SAATHI SIH / Prototype specification.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting SAATHI demo data seeding...'))

        # 1. States & Districts
        states_data = [
            ('Maharashtra', 'MH'),
            ('Uttar Pradesh', 'UP'),
            ('Madhya Pradesh', 'MP'),
            ('Rajasthan', 'RJ'),
            ('Bihar', 'BR'),
            ('Karnataka', 'KA'),
        ]
        states = {}
        for name, code in states_data:
            st, _ = State.objects.get_or_create(name=name, defaults={'code': code})
            states[name] = st

        districts_data = [
            ('Pune', 'Maharashtra', 'MH-PUN', 42.0, 68.0),
            ('Nagpur', 'Maharashtra', 'MH-NAG', 78.0, 48.0),
            ('Thane', 'Maharashtra', 'MH-THA', 32.0, 64.0),
            ('Nashik', 'Maharashtra', 'MH-NAS', 36.0, 56.0),
            ('Aurangabad', 'Maharashtra', 'MH-AUR', 48.0, 60.0),
            ('Lucknow', 'Uttar Pradesh', 'UP-LKO', 55.0, 32.0),
            ('Varanasi', 'Uttar Pradesh', 'UP-VNS', 68.0, 38.0),
            ('Bhopal', 'Madhya Pradesh', 'MP-BHO', 45.0, 48.0),
            ('Jaipur', 'Rajasthan', 'RJ-JAI', 30.0, 30.0),
            ('Patna', 'Bihar', 'BR-PAT', 75.0, 35.0),
            ('Bengaluru Urban', 'Karnataka', 'KA-BLR', 45.0, 85.0),
        ]
        districts = {}
        for name, st_name, code, cx, cy in districts_data:
            dst, _ = District.objects.get_or_create(
                name=name,
                state=states[st_name],
                defaults={'code': code, 'coord_x': cx, 'coord_y': cy}
            )
            districts[name] = dst

        # 2. Demonstration Users & Personas
        users_data = [
            ('dist_officer', 'officer@saathi.gov.in', 'Rajesh', 'Patil', RoleChoices.DISTRICT_OFFICER, 'Pune', 'District Social Welfare Officer', '+91 98220 11200'),
            ('counsellor_sunita', 'sunita@saathi.gov.in', 'Dr. Sunita', 'Deshmukh', RoleChoices.COUNSELLOR, 'Pune', 'Senior Clinical Psychosocial Counsellor', '+91 98230 44102'),
            ('state_admin', 'stateadmin@saathi.gov.in', 'Vikram', 'Shinde', RoleChoices.STATE_ADMIN, 'Pune', 'State Atrocity Monitoring Director', '+91 98200 99881'),
            ('national_admin', 'national@saathi.gov.in', 'Dr. Amit', 'Verma', RoleChoices.NATIONAL_ADMIN, 'Pune', 'National Nodal Protection Advisor', '+91 99110 00112'),
            ('victim_citizen', 'citizen@saathi.gov.in', 'Anonymous', 'Citizen', RoleChoices.VICTIM_CITIZEN, 'Pune', 'Protected Citizen / Victim', '+91 98000 00001'),
        ]
        users = {}
        for username, email, first, last, role, dist_name, desig, phone in users_data:
            u, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'role': role,
                    'district': districts[dist_name],
                    'state': districts[dist_name].state,
                    'designation': desig,
                    'phone_number': phone,
                }
            )
            if created:
                u.set_password('demopassword2026')
                u.save()
            users[username] = u

        # 3. Department Integrations
        dept_data = [
            (DepartmentCodeChoices.POLICE, 'State Police (CCTNS / ICJS)'),
            (DepartmentCodeChoices.COURT, 'Special Court (eCourts / CIS)'),
            (DepartmentCodeChoices.SOCIAL_JUSTICE, 'Social Justice & Empowerment Dept'),
            (DepartmentCodeChoices.HEALTH, 'District Health & Civil Hospital'),
            (DepartmentCodeChoices.LEGAL_AID, 'District Legal Services Authority (DLSA)'),
            (DepartmentCodeChoices.WITNESS_PROTECTION, 'District Witness Protection Committee'),
        ]
        depts = {}
        for code, name in dept_data:
            d, _ = DepartmentIntegration.objects.get_or_create(code=code, defaults={'name': name})
            depts[code] = d

        # 4. Primary Demo Case: ATC-2026-10482
        pune_dist = districts['Pune']
        sub1, _ = Subject.objects.get_or_create(
            anonymous_id='Anonymous Subject #V-10482',
            defaults={'role': 'Victim', 'masked_contact': '•••• •••• 4819', 'user': users['victim_citizen']}
        )

        c1, _ = Case.objects.get_or_create(
            id='ATC-2026-10482',
            defaults={
                'subject': sub1,
                'case_type': CaseTypeChoices.SEXUAL_ASSAULT,
                'district': pune_dist,
                'state': pune_dist.state,
                'current_stage': CaseStageChoices.INVESTIGATION,
                'distress_score': 82,
                'previous_distress_score': 68,
                'baseline_score': 39,
                'risk_level': RiskLevelChoices.HIGH,
                'trend_direction': 'increasing',
                'trend_delta': '↑ +14 (7d)',
                'monitoring_status': 'Elevated',
                'priority': PriorityChoices.P1,
                'assigned_counsellor': users['counsellor_sunita'],
                'counsellor_phone': '+91 98230 44102',
                'fir_number': 'FIR No. 442/26 (Haveli PS)',
                'police_station': 'Haveli Police Station',
                'special_court': 'Pune District Special SC/ST Court',
                'text_sentiment': 'High Distress',
                'distress_language_status': 'Critical',
                'voice_stress_status': 'Elevated',
                'emotion_signal': 'Fear',
                'engagement_rate_change': '↓ 32%',
                'missed_follow_ups': 2,
                'response_frequency': 'Declining',
                'primary_contributing_factor': 'Rapid deterioration in longitudinal distress trend (+14 pts in 7 days).',
                'ai_explanation_summary': 'Multi-modal signals indicate acute escalation following suspect bail hearing. NLP detected threat keywords ("watching", "compromise"), with 2 missed check-ins and heightened voice tremors during callback.'
            }
        )

        # Baseline
        PersonalBaseline.objects.get_or_create(
            case=c1,
            defaults={'baseline_score': 39.0, 'sample_count': 5}
        )

        # 6-Week Longitudinal Trajectory
        traj_points = [
            (datetime(2026, 8, 2).date(), 'Week 1', 38, 92, 15, 5, 4, 'Investigation', 'Normal baseline check-in response', 'Initial FIR filed, preliminary legal counsellor assigned.'),
            (datetime(2026, 8, 7).date(), 'Week 2', 41, 88, 5, 8, 4, 'Investigation', 'Mild apprehension about court summons', 'Periodic check-in completed via SMS chatbot.'),
            (datetime(2026, 8, 12).date(), 'Week 3', 47, 82, -12, 14, 3, 'Investigation', 'Subtle shift in tone during IVRS check-in', 'Charge-sheet drafting phase begins.'),
            (datetime(2026, 8, 16).date(), 'Week 4', 52, 74, -28, 22, 3, 'Investigation', 'Anxiety regarding identity disclosure in local village', 'First counselling support session conducted.'),
            (datetime(2026, 8, 18).date(), 'Week 5 (Mid)', 61, 60, -45, 48, 2, 'Investigation', 'Increased negative sentiment; fear of retaliation', 'Accused granted interim bail hearing; distress upward shift detected.'),
            (datetime(2026, 8, 21).date(), 'Week 5 (End)', 72, 48, -64, 65, 1, 'Investigation', 'Missed follow-up & Voice stress elevation (+24%)', 'Failed to respond to 2 automated check-ins; voice stress high on callback.'),
            (datetime(2026, 8, 24).date(), 'Week 6 (Current)', 82, 36, -82, 88, 1, 'Investigation', 'Threat-related language detected: "they are watching the house"', 'CRITICAL ESCALATION: Explicit intimidation signal flagged by NLP layer.'),
        ]
        for dt, w_label, dist_s, eng_s, sent_s, thr_s, freq, stg, sig, nts in traj_points:
            LongitudinalMetric.objects.get_or_create(
                case=c1,
                recorded_date=dt,
                defaults={
                    'week_label': w_label,
                    'distress_score': dist_s,
                    'engagement_score': eng_s,
                    'sentiment_score': sent_s,
                    'threat_signal_score': thr_s,
                    'check_in_frequency': freq,
                    'case_stage': stg,
                    'detected_signal': sig,
                    'notes': nts
                }
            )

        # Contributing factors for c1
        factors = [
            ("Rapid increase in distress score", 18, "Trend", "Longitudinal distress accelerated from 52 to 82 in under 14 days."),
            ("Negative sentiment trend", 14, "Sentiment", "Semantic polarity shifted -68% into persistent dread and helplessness markers."),
            ("Threat-related language detected", 12, "Threat", "Keywords relating to physical surveillance and coercion identified in Chatbot dialogue."),
            ("Reduced engagement", 9, "Engagement", "Interaction participation dropped by 32% compared to historical baseline."),
            ("Missed follow-up interactions", 7, "Behavioral", "Two consecutive daily wellbeing pulses unanswered without prior notice."),
        ]
        for fact, pts, cat, desc in factors:
            ContributingFactorItem.objects.get_or_create(
                case=c1,
                factor=fact,
                defaults={'points': pts, 'category': cat, 'description': desc}
            )

        # Milestones for c1
        milestones = [
            (CaseStageChoices.COMPLAINT, 'Formal FIR Registered & Intake', '2026-07-28', True, False, 'Baseline (38/100)', ['Legal Aid assigned', 'Initial safety debrief'], ['FIR No. 442/26 registered at Haveli PS', 'Consent for dynamic monitoring received']),
            (CaseStageChoices.INVESTIGATION, 'Bail Hearing & Vulnerability Surge', '2026-08-18', True, True, 'Surge (82/100)', ['Witness Protection deployed', 'Emergency clinical session'], ['Interim bail hearing contested', 'Threat complaint filed']),
            (CaseStageChoices.TRIAL, 'Special Court Trial & Deposition', '2026-09-15', False, False, 'Pending (Target ≤ 45)', ['Court Escort Security', 'In-camera deposition requested'], ['Summons issued to 4 witnesses', 'Section 15A protection notice']),
            (CaseStageChoices.COMPENSATION, 'Statutory Relief & Rehabilitation', '2026-10-02', False, False, 'Pending', ['DBT Relief processing', 'Skill training enrolment'], ['25% interim compensation disbursed', 'Housing allotment underway']),
        ]
        for idx, (stg, tit, dt, comp, is_curr, trend_t, intvs, evts) in enumerate(milestones):
            CaseMilestone.objects.get_or_create(
                case=c1,
                title=tit,
                defaults={
                    'stage': stg,
                    'date': dt,
                    'completed': comp,
                    'is_current': is_curr,
                    'distress_trend': trend_t,
                    'interventions': intvs,
                    'important_events': evts,
                    'order': idx
                }
            )

        # Timeline Events for c1
        events = [
            ('CRITICAL_ALERT', 'CRITICAL Risk Alert Dispatched: Vulnerability index exceeded 80/100', 'Automated trigger: composite distress score surged +14 pts with active surveillance threat keywords.', 'critical'),
            ('INTERACTION', 'Chatbot Interaction Flagged: Direct threat language detected', '"two unknown men on a bike were stationed near the flour mill asking about my court date"', 'warning'),
            ('DEPT_COURT', 'Court Hearing Update: Accused interim bail hearing concluded', 'Hearing adjourned to Aug 28 for final order. Notice issued under Witness Protection Scheme.', 'info'),
            ('INTERVENTION', 'Emergency Clinical Counselling Session Scheduled', 'Dr. Sunita Deshmukh assigned for in-person home visit with local Mahila Police escort.', 'info'),
            ('CASE_CREATED', 'Formal Case Registration and Dynamic Baseline Established', 'Intake completed under Section 3(1)(w) and Section 3(2)(v) of SC/ST (PoA) Act.', 'info'),
        ]
        for ev_type, tit, desc, sev in events:
            CaseEvent.objects.get_or_create(
                case=c1,
                title=tit,
                defaults={'event_type': ev_type, 'description': desc, 'severity': sev, 'created_by': users['dist_officer']}
            )

        # Alerts for c1
        Alert.objects.get_or_create(
            id='ALT-2026-10482',
            case=c1,
            defaults={
                'risk_level': RiskLevelChoices.HIGH,
                'status': AlertStatusChoices.UNREAD,
                'distress_score': 82,
                'previous_distress_score': 68,
                'delta_label': '+14 pts',
                'primary_factor': 'Rapid deterioration in longitudinal distress trend (+14 pts in 7 days).',
                'contributing_factors': [
                    {'factor': 'Rapid increase in distress score', 'points': 18, 'category': 'Trend'},
                    {'factor': 'Negative sentiment trend', 'points': 14, 'category': 'Sentiment'},
                    {'factor': 'Threat-related language detected', 'points': 12, 'category': 'Threat'},
                    {'factor': 'Reduced engagement', 'points': 9, 'category': 'Engagement'},
                ],
                'recommended_actions': [
                    'Dispatch emergency protection officer for immediate physical security audit.',
                    'Schedule high-priority psychosocial session with Dr. Sunita Deshmukh within 4 hours.',
                    'Issue formal Section 15A protection notice to Haveli Police Station.'
                ],
                'assigned_to': users['dist_officer']
            }
        )

        # Interventions for c1
        intvs_c1 = [
            ('INTV-2026-4412', InterventionTypeChoices.WITNESS_PROTECTION, 'Armed Witness Escort for Court Appearance', 'Deployment of 2 dedicated female constables during travel to Pune District Special Court.', InterventionStatusChoices.IN_PROGRESS, 'P1', 'Superintendent of Police (Rural)', '2026-08-28'),
            ('INTV-2026-4413', InterventionTypeChoices.COUNSELLING, 'Trauma-Informed Cognitive & Psychosocial Pulse', 'Clinical counselling protocol session addressing acute sleep disruption and hyper-vigilance.', InterventionStatusChoices.IN_PROGRESS, 'P1', 'Dr. Sunita Deshmukh (Dist. Counsellor)', '2026-08-26'),
            ('INTV-2026-4414', InterventionTypeChoices.LEGAL_AID, 'Free Legal Representation & Bail Opposition Filing', 'Drafting affidavit to oppose regular bail in High Court on grounds of witness intimidation.', InterventionStatusChoices.COMPLETED, 'P2', 'District Legal Services Authority (DLSA)', '2026-08-20'),
            ('INTV-2026-4415', InterventionTypeChoices.FINANCIAL_ASSISTANCE, 'Statutory Immediate Relief Disbursement (₹1.5 Lakh)', 'First installment of monetary relief credited under Rule 12(4) of SC/ST (PoA) Rules.', InterventionStatusChoices.COMPLETED, 'P2', 'Social Justice & Empowerment Dept', '2026-08-10'),
        ]
        for i_id, i_type, tit, desc, stat, prio, dept, tgt in intvs_c1:
            Intervention.objects.get_or_create(
                id=i_id,
                case=c1,
                defaults={
                    'type': i_type,
                    'title': tit,
                    'description': desc,
                    'status': stat,
                    'priority': prio,
                    'department': dept,
                    'target_date': tgt,
                    'assigned_to': users['counsellor_sunita'] if 'Sunita' in dept else users['dist_officer'],
                    'assigned_to_name': 'Dr. Sunita Deshmukh' if 'Sunita' in dept else 'District Welfare Cell'
                }
            )

        # 5. Additional Diverse Cases across Districts & Stages
        other_cases = [
            ('ATC-2026-09941', 'Anonymous Subject #V-09941', 'Witness', CaseTypeChoices.WITNESS_INTIMIDATION, 'Nagpur', 78, 62, 34, RiskLevelChoices.HIGH, 'Investigation', '↑ +16 (7d)', 'P1', 'Elevated'),
            ('ATC-2026-11029', 'Anonymous Subject #V-11029', 'Victim', CaseTypeChoices.CASTE_VIOLENCE, 'Thane', 71, 74, 40, RiskLevelChoices.HIGH, 'Trial', '↓ -3 (7d)', 'P2', 'Active'),
            ('ATC-2026-08812', 'Anonymous Subject #V-08812', 'Victim', CaseTypeChoices.SOCIAL_BOYCOTT, 'Nashik', 58, 49, 32, RiskLevelChoices.MODERATE, 'Complaint', '↑ +9 (7d)', 'P2', 'Active'),
            ('ATC-2026-07734', 'Anonymous Subject #V-07734', 'Family Member', CaseTypeChoices.LAND_DISPOSSESSION, 'Aurangabad', 44, 42, 38, RiskLevelChoices.MODERATE, 'Trial', '→ +2 (7d)', 'P3', 'Active'),
            ('ATC-2026-06619', 'Anonymous Subject #V-06619', 'Victim', CaseTypeChoices.SC_ST_ATROCITY, 'Lucknow', 36, 40, 35, RiskLevelChoices.LOW, 'Compensation', '↓ -4 (7d)', 'P3', 'Active'),
            ('ATC-2026-05520', 'Anonymous Subject #V-05520', 'Victim', CaseTypeChoices.PHYSICAL_ASSAULT, 'Bhopal', 88, 70, 42, RiskLevelChoices.CRITICAL, 'Investigation', '↑ +18 (7d)', 'P1', 'Elevated'),
            ('ATC-2026-04418', 'Anonymous Subject #V-04418', 'Witness', CaseTypeChoices.HATE_CRIME, 'Jaipur', 24, 26, 30, RiskLevelChoices.LOW, 'Rehabilitation', '↓ -2 (7d)', 'P3', 'Active'),
        ]

        for cid, anon_id, s_role, ctype, dist_n, dscore, prev_d, base_s, rlevel, stg, tr_d, prio, mstat in other_cases:
            d_obj = districts[dist_n]
            subj, _ = Subject.objects.get_or_create(anonymous_id=anon_id, defaults={'role': s_role})
            c_obj, _ = Case.objects.get_or_create(
                id=cid,
                defaults={
                    'subject': subj,
                    'case_type': ctype,
                    'district': d_obj,
                    'state': d_obj.state,
                    'current_stage': stg,
                    'distress_score': dscore,
                    'previous_distress_score': prev_d,
                    'baseline_score': base_s,
                    'risk_level': rlevel,
                    'trend_delta': tr_d,
                    'trend_direction': 'increasing' if '+' in tr_d else ('decreasing' if '-' in tr_d else 'stable'),
                    'priority': prio,
                    'monitoring_status': mstat,
                    'assigned_counsellor': users['counsellor_sunita'],
                    'primary_contributing_factor': f'Monitoring evaluation in {dist_n} under {ctype}.',
                    'ai_explanation_summary': f'Standard longitudinal assessment confirms {rlevel} status.'
                }
            )
            # Create a sample milestone
            CaseMilestone.objects.get_or_create(
                case=c_obj,
                title=f'Initial Intake & Legal Support ({stg})',
                defaults={'stage': stg, 'date': '2026-08-01', 'completed': True, 'order': 1}
            )

        # 6. Audit Log
        AuditLog.objects.create(
            user=users['dist_officer'],
            user_role='DISTRICT_OFFICER',
            action='SYSTEM_DEMO_SEED',
            resource_type='Database',
            resource_id='ALL',
            details={'message': 'Demo dataset initialized successfully with 8 cases and complete trajectory.'}
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded complete SAATHI demo dataset!'))
