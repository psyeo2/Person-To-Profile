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
        gathers immediate reactions. All responses stay on this device during
        the session.
      </p>
      <div class="form-actions">
        <button class="btn" @click="start">Start now</button>
        <span class="muted">5–7 minutes from start to finish.</span>
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

      <div class="card status-card">
        <div class="pill pill--accent">What to expect</div>
        <div class="status-metric">
          <span>Two ads per participant</span>
          <strong>2× tailored</strong>
        </div>
        <div class="status-metric">
          <span>Questionnaires</span>
          <strong>Profile + follow-up</strong>
        </div>
        <div class="status-metric">
          <span>Data handling</span>
          <strong>Session only</strong>
        </div>
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
