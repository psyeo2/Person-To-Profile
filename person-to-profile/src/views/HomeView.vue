<template>
  <div class="page">
    <section class="card home-hero">
      <p class="section-title">
        <span class="dot" aria-hidden="true"></span>
        <span>Advertising research prototype</span>
      </p>
      <h1 class="hero-title">
        A guided test to see which ads land with each audience.
      </h1>
      <p class="hero-lede">
        This private tool walks participants through a concise demographic
        questionnaire, shows two creatives that match their profile, then
        gathers immediate reactions. All responses are anonymised before
        storage.
      </p>
      <div class="form-actions">
        <button class="btn" @click="start">Start now</button>
        <span class="muted">5-7 minutes from start to finish.</span>
      </div>
    </section>

    <section class="home-grid">
      <div class="card">
        <div class="home-steps">
          <div v-for="step in steps" :key="step.title" class="step">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.copy }}</p>
          </div>
        </div>
      </div>

      <div class="card insights-card">
        <div class="insights-header">
          <h3 class="insights-title">What to expect</h3>
        </div>
        <ul class="insights-list">
          <li>
            <div class="dot-badge">1</div>
            <div>
              <p class="insight-label">Two ads per participant</p>
              <p class="insight-value">Tailored to the profile answers</p>
            </div>
          </li>
          <li>
            <div class="dot-badge">2</div>
            <div>
              <p class="insight-label">Questionnaires</p>
              <p class="insight-value">Profile before, reactions after</p>
            </div>
          </li>
          <li>
            <div class="dot-badge">3</div>
            <div>
              <p class="insight-label">Data handling</p>
              <p class="insight-value">Session-only, no identifiers stored</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const steps = [
  {
    title: "Access",
    copy: "Enter the shared password to enter this private study space.",
  },
  {
    title: "Demographics",
    copy: "Answer a short profile questionnaire so we can place you into a test audience.",
  },
  {
    title: "Ads",
    copy: "View two creatives tailored to the audience traits you provided.",
  },
  {
    title: "Follow-up",
    copy: "Share what resonated and why. Your qualitative feedback matters most.",
  },
];

const start = () => router.push({ name: "login" });
</script>
