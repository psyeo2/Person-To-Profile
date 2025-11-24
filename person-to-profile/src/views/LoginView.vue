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

      <form class="form-grid" @submit.prevent="submit">
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

        <div class="form-actions">
          <button class="btn" type="submit">Continue</button>
          <span class="muted">Single password for all participants.</span>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SURVEY_PASSWORD, useSurveyState } from "@/lib/surveyState";

const router = useRouter();
const route = useRoute();
const { setAuthenticated, resetSession } = useSurveyState();

const password = ref("");
const error = ref("");

const submit = () => {
  if (password.value.trim() === SURVEY_PASSWORD) {
    error.value = "";
    setAuthenticated(true);
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : null;
    router.push(redirect || { name: "pre-questionnaire" });
    return;
  }

  error.value = "Incorrect password. Please check the invite.";
};

resetSession();
</script>
