from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, State, District, RoleChoices
from apps.cases.models import Case, Subject, RiskLevelChoices, PriorityChoices
from apps.alerts.models import Alert, AlertStatusChoices

class SaathiBackendIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.state = State.objects.create(name="Maharashtra", code="MH")
        self.district = District.objects.create(name="Pune", state=self.state, code="MH-PUN")

        self.officer = User.objects.create_user(
            username="test_officer",
            email="officer@test.gov.in",
            password="password123",
            role=RoleChoices.DISTRICT_OFFICER,
            district=self.district,
            state=self.state
        )

        self.subject = Subject.objects.create(anonymous_id="Anonymous Subject #V-TEST", role="Victim")
        self.case = Case.objects.create(
            id="ATC-2026-TEST01",
            subject=self.subject,
            case_type="Sexual Assault",
            district=self.district,
            state=self.state,
            current_stage="Investigation",
            distress_score=75,
            baseline_score=40,
            risk_level=RiskLevelChoices.HIGH,
            priority=PriorityChoices.P1
        )

    def test_demo_login(self):
        response = self.client.post('/api/auth/demo-login/', {'role': 'DISTRICT_OFFICER'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['data'])

    def test_case_list_and_detail(self):
        self.client.force_authenticate(user=self.officer)
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)

        detail_res = self.client.get(f'/api/cases/{self.case.id}/')
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data['data']['distressScore'], 75)

    def test_sos_trigger(self):
        self.client.force_authenticate(user=self.officer)
        response = self.client.post(f'/api/cases/{self.case.id}/trigger-sos/', {
            'reason': 'Emergency panic button triggered by protected subject.'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.case.refresh_from_db()
        self.assertEqual(self.case.risk_level, RiskLevelChoices.CRITICAL)
        self.assertEqual(self.case.distress_score, 90)

    def test_interaction_simulator_and_scoring(self):
        response = self.client.post('/api/interactions/simulate/', {
            'case_id': self.case.id,
            'channel': 'Chatbot',
            'response_text': 'I am extremely scared, two men on bikes were following me near my house and threatened to compromise the court case.',
            'language': 'en',
            'simulated_voice_stress': 75
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.case.refresh_from_db()
        # Verify distress score and risk classification updated
        self.assertTrue(self.case.distress_score > 0)
        self.assertIn(self.case.risk_level, [RiskLevelChoices.HIGH, RiskLevelChoices.CRITICAL])

    def test_alert_lifecycle(self):
        self.client.force_authenticate(user=self.officer)
        alert = Alert.objects.create(
            id="ALT-2026-TEST01",
            case=self.case,
            risk_level=RiskLevelChoices.HIGH,
            status=AlertStatusChoices.UNREAD,
            distress_score=85,
            primary_factor="Rapid distress elevation."
        )

        ack_res = self.client.post(f'/api/alerts/{alert.id}/action/', {'action': 'acknowledge'})
        self.assertEqual(ack_res.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertEqual(alert.status, AlertStatusChoices.ACKNOWLEDGED)

        resolve_res = self.client.post(f'/api/alerts/{alert.id}/action/', {
            'action': 'resolve',
            'notes': 'Protected escort provided and verified.'
        })
        self.assertEqual(resolve_res.status_code, status.HTTP_200_OK)
        alert.refresh_from_db()
        self.assertEqual(alert.status, AlertStatusChoices.RESOLVED)

    def test_department_webhook_simulation(self):
        self.client.force_authenticate(user=self.officer)
        response = self.client.post('/api/integrations/simulate-event/', {
            'case_id': self.case.id,
            'event_code': 'RELIEF_DISBURSED',
            'summary': 'DBT: Immediate monetary relief of ₹1,00,000 credited.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.case.refresh_from_db()
        self.assertEqual(self.case.current_stage, 'Compensation')

    def test_analytics_endpoints(self):
        self.client.force_authenticate(user=self.officer)
        res_dist = self.client.get('/api/analytics/district/')
        self.assertEqual(res_dist.status_code, status.HTTP_200_OK)
        res_state = self.client.get('/api/analytics/state/')
        self.assertEqual(res_state.status_code, status.HTTP_200_OK)
        res_nat = self.client.get('/api/analytics/national/')
        self.assertEqual(res_nat.status_code, status.HTTP_200_OK)
