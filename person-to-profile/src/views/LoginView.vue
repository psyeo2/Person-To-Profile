<template>
  <div class="page">
    <section class="card auth-card">
      <p class="section-title">
        <span class="dot" aria-hidden="true"></span>
        <span>Session access</span>
      </p>
      <h1 class="login-title">Enter the shared password to begin</h1>
      <p class="auth-note">
        This protects the research flow from accidental visitors. You will
        immediately start the demographic questionnaire after unlocking.
      </p>

      <form class="form-grid" ref="loginForm" @submit.prevent="submit">
        <div class="form-field">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="input-control"
            type="password"
            autocomplete="off"
            placeholder="Enter the access code provided"
            required
          />
          <p v-if="error" class="error-text">{{ error }}</p>
        </div>

        <div class="form-field">
          <div
            id="turnstile-check"
            ref="turnstileRef"
            class="cf-turnstile"
            :data-sitekey="turnstileSiteKey"
            data-theme="light"
          ></div>
        </div>

        <div class="form-actions">
          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? "Starting..." : "Continue" }}
          </button>
          <span class="muted">Single password for all participants.</span>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SURVEY_PASSWORD, useSurveyState } from "@/lib/surveyState";
import { createNewParticipant } from "@/api";

const router = useRouter();
const route = useRoute();
const { setAuthenticated, resetSession, setParticipantId } = useSurveyState();

const password = ref("");
const error = ref("");
const loading = ref(false);
const loginForm = ref<HTMLFormElement | null>(null);
const turnstileRef = ref<HTMLDivElement | null>(null);
const turnstileToken = ref("");
const turnstileSiteKey = "0x4AAAAAACCsecht_9Qy8ej_";
const widgetId = ref<string | null>(null);

const getTurnstileToken = () =>
  (loginForm.value?.querySelector<HTMLInputElement>(
    'input[name="cf-turnstile-response"]'
  )?.value || "").trim();

const resetTurnstileWidget = () => {
  turnstileToken.value = "";
  const tokenInput = loginForm.value?.querySelector<HTMLInputElement>(
    'input[name="cf-turnstile-response"]'
  );
  if (tokenInput) tokenInput.value = "";

  const turnstile = (window as any)?.turnstile;
  if (turnstile?.reset && widgetId.value) {
    try {
      turnstile.reset(widgetId.value);
    } catch {
      // ignore reset issues to avoid blocking the flow
    }
  }
};

const waitForTurnstile = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const existing = (window as any).turnstile;
    if (existing) return resolve(existing);

    const timeout = window.setTimeout(() => {
      window.clearInterval(poller);
      reject(new Error("Turnstile failed to load"));
    }, 5000);

    const poller = window.setInterval(() => {
      const turnstile = (window as any).turnstile;
      if (!turnstile) return;
      window.clearInterval(poller);
      window.clearTimeout(timeout);
      resolve(turnstile);
    }, 50);
  });

const renderTurnstile = async () => {
  if (!turnstileRef.value || widgetId.value) return;
  try {
    const turnstile = await waitForTurnstile();
    widgetId.value = turnstile.render(turnstileRef.value, {
      sitekey: turnstileSiteKey,
      theme: "light",
      callback: (token: string) => {
        turnstileToken.value = token;
        error.value = "";
      },
      "error-callback": () => {
        error.value = "Turnstile could not load. Please refresh and try again.";
      },
      "expired-callback": () => {
        turnstileToken.value = "";
      },
    });
  } catch {
    error.value = "Turnstile could not load. Please refresh and try again.";
  }
};

onMounted(() => {
  renderTurnstile();
});

onBeforeUnmount(() => {
  const turnstile = (window as any)?.turnstile;
  if (turnstile?.remove && widgetId.value) {
    try {
      turnstile.remove(widgetId.value);
    } catch {
      // best-effort cleanup
    }
  }
});

const submit = async () => {
  if (password.value.trim() !== SURVEY_PASSWORD) {
    error.value = "Incorrect password. Please check the invite.";
    return;
  }

  const token = turnstileToken.value || getTurnstileToken();
  if (!token) {
    error.value = "Please confirm you're not a robot.";
    return;
  }

  turnstileToken.value = token;
  loading.value = true;
  error.value = "";

  try {
    const { participantId } = await createNewParticipant(turnstileToken.value);
    setParticipantId(Number(participantId));
    setAuthenticated(true);
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : null;
    router.push(redirect || { name: "pre-questionnaire" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to start a new session.";
    error.value = message;
    resetTurnstileWidget();
  } finally {
    loading.value = false;
  }
};

resetSession();
</script>
