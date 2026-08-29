const enabled = (value: string | undefined): boolean => value?.trim().toLowerCase() === 'true';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api/v1';
const demoMode = enabled(import.meta.env.VITE_DEMO_MODE);
const requestedMockApi = enabled(import.meta.env.VITE_USE_MOCK_API);

if (requestedMockApi && !demoMode) {
  throw new Error('VITE_USE_MOCK_API requires VITE_DEMO_MODE=true.');
}
if (demoMode && !requestedMockApi) {
  throw new Error('VITE_DEMO_MODE requires VITE_USE_MOCK_API=true for an isolated local demo.');
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl: configuredApiBaseUrl.replace(/\/+$/, ''),
  demoMode,
  useMockApi: demoMode && requestedMockApi,
});

export const PRIMARY_DEMO_CASE_ID = 'ATC-2026-10482';
