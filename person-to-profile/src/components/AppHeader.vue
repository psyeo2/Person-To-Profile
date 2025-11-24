<template>
  <header class="app-header">
    <div class="brand">
      <div class="brand__mark">AR</div>
      <div class="brand__text">
        <div class="brand__title">Aoife Research Lab</div>
        <div class="brand__tagline">
          Private prototype for targeted creative testing
        </div>
      </div>
    </div>

    <div class="header-actions">
      <div class="theme-toggle">
        <img class="theme-icon" :src="SunIcon" alt="" />
        <label class="switch">
          <input
            type="checkbox"
            :checked="theme === 'dark'"
            @change="toggleTheme"
            aria-label="Toggle theme"
          />
          <span class="slider"></span>
        </label>
        <img class="theme-icon" :src="MoonIcon" alt="" />
      </div>

      <div class="stepper">
        <div
          v-for="step in steps"
          :key="step.key"
          class="stepper__item"
          :class="{
            'stepper__item--active': step.status === 'active',
            'stepper__item--done': step.status === 'done',
          }"
        >
          <span>{{ step.label }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useSurveyState } from "@/lib/surveyState";
import SunIcon from "@/assets/icons/sun-fill.svg";
import MoonIcon from "@/assets/icons/moon-fill.svg";

const route = useRoute();
const { state } = useSurveyState();
const theme = ref<"light" | "dark">("light");

const steps = computed(() => {
  const current = route.name;
  return [
    {
      key: "login",
      label: "Access",
      status: state.isAuthenticated
        ? "done"
        : current === "login"
        ? "active"
        : "pending",
    },
    {
      key: "profile",
      label: "Profile",
      status: state.hasSubmittedPre
        ? "done"
        : current === "pre-questionnaire"
        ? "active"
        : "pending",
    },
    {
      key: "ads",
      label: "Ads",
      status: state.hasSeenAds
        ? "done"
        : current === "content"
        ? "active"
        : "pending",
    },
    {
      key: "follow-up",
      label: "Follow-up",
      status: state.hasCompletedPost
        ? "done"
        : current === "post-questionnaire"
        ? "active"
        : "pending",
    },
  ];
});

const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
};

const applyTheme = (value: "light" | "dark") => {
  const root = document.documentElement;
  root.setAttribute("data-theme", value);
  try {
    localStorage.setItem("theme-preference", value);
  } catch {
    /* ignore storage errors */
  }
};

onMounted(() => {
  const stored = localStorage.getItem("theme-preference");
  if (stored === "light" || stored === "dark") {
    theme.value = stored;
  }
  applyTheme(theme.value);
});

watch(theme, (value) => applyTheme(value));
</script>
