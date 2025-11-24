<template>
  <div class="page">
    <section class="card ads-header">
      <p class="section-title">
        <span class="dot" aria-hidden="true"></span>
        <span>Selected ads</span>
      </p>
      <h1 class="questionnaire-title">Two creatives chosen for your profile</h1>
      <p class="questionnaire-lede">
        Segment: <strong>{{ selectedSegment }}</strong> · {{ selectedReason }}
      </p>
    </section>

    <section class="card">
      <div class="ads-grid" v-if="state.ads.length">
        <article v-for="ad in state.ads" :key="ad.id" class="ad-card">
          <div class="ad-badge">{{ ad.badge }}</div>
          <h3 class="ad-title">{{ ad.name }}</h3>
          <p class="ad-headline">{{ ad.headline }}</p>
          <p class="ad-copy">{{ ad.copy }}</p>
          <div class="ad-meta">
            <span class="pill pill--soft">Angle: {{ ad.angle }}</span>
          </div>
        </article>
      </div>
      <p v-else class="muted">We are preparing your ads...</p>

      <div class="ads-actions">
        <button class="btn" type="button" @click="confirmViewed">
          I’ve viewed both ads
        </button>
        <button
          class="btn btn-secondary"
          type="button"
          @click="router.push({ name: 'pre-questionnaire' })"
        >
          Update my profile answers
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  useSurveyState,
  type DemographicAnswers,
  type SelectedAd,
} from "@/lib/surveyState";

type AdSet = {
  ads: SelectedAd[];
  segment: string;
  reason: string;
};

const router = useRouter();
const { state, setAds, markAdsViewed } = useSurveyState();
const segment = ref("General audience");
const reason = ref("Default blend while we learn more about this profile.");

const adSets: Record<"youth" | "premium" | "wellness" | "general", AdSet> = {
  youth: {
    segment: "Momentum seekers (18-30)",
    reason: "Younger profile with moderate ad awareness.",
    ads: [
      {
        id: "pulse-run",
        name: "Pulse Run",
        headline: "Daily running trainers that adapt to your stride.",
        copy: "Breathable mesh, recycled foam, and personal coaching nudges inside the app.",
        badge: "Fitness",
        angle: "Mobility + confidence",
      },
      {
        id: "beam-stream",
        name: "BeamStream+",
        headline: "All your streaming, one pass, student-first pricing.",
        copy: "Bundle music, shows, and cloud storage with one login and weekly drops.",
        badge: "Media",
        angle: "Value + discovery",
      },
    ],
  },
  premium: {
    segment: "Affluent professionals",
    reason: "Higher income bracket and likely premium product affinity.",
    ads: [
      {
        id: "alto-ev",
        name: "ALTO Electric",
        headline: "The quiet EV built for long-range city escapes.",
        copy: "400+ mile range, lounge interior, white-glove delivery, and carbon-offset charging.",
        badge: "Auto",
        angle: "Luxury + sustainability",
      },
      {
        id: "haven-retreat",
        name: "Haven Retreats",
        headline: "Off-grid stays with on-demand concierge.",
        copy: "Architected cabins, chef-prepped ingredients, and guided recovery sessions.",
        badge: "Travel",
        angle: "Restoration + exclusivity",
      },
    ],
  },
  wellness: {
    segment: "Wellness focused",
    reason: "Balanced life stage with interest in wellbeing and comfort.",
    ads: [
      {
        id: "lumen-health",
        name: "Lumen Health",
        headline: "A preventative health plan that meets you weekly.",
        copy: "At-home biomarker tracking, video clinicians, and personalised action plans.",
        badge: "Health",
        angle: "Reassurance + support",
      },
      {
        id: "ember-home",
        name: "Ember Home",
        headline: "Smarter heating that learns your rhythm.",
        copy: "Warmth without waste, adaptive schedules, and a 60-day comfort guarantee.",
        badge: "Home",
        angle: "Comfort + control",
      },
    ],
  },
  general: {
    segment: "Everyday planners",
    reason: "Balanced responses without strong signals for niche sets.",
    ads: [
      {
        id: "freshbox",
        name: "FreshBox",
        headline: "Meal kits that cut prep, not flavour.",
        copy: "Seasonal menus, pre-portioned ingredients, and zero-plastic packing.",
        badge: "Food",
        angle: "Ease + variety",
      },
      {
        id: "orbit-mobile",
        name: "Orbit Mobile",
        headline: "Simple data plans that flex with your month.",
        copy: "Keep your number, pause anytime, and add roaming with one tap.",
        badge: "Mobile",
        angle: "Control + savings",
      },
    ],
  },
};

const pickAdSet = (answers: DemographicAnswers): AdSet => {
  const age = Number(answers.age ?? 0);
  const income = answers.income || "";
  const adFrequency = Number(answers.adFrequency ?? 0);

  if (income.includes("£80k") || income.includes("Above £120k")) {
    return adSets.premium;
  }

  if (age > 45) {
    return adSets.wellness;
  }

  if (age > 0 && age <= 30) {
    return adSets.youth;
  }

  if (adFrequency >= 12) {
    return adSets.youth;
  }

  return adSets.general;
};

const ensureAds = () => {
  const set = pickAdSet(state.preAnswers);
  segment.value = set.segment;
  reason.value = set.reason;

  if (state.ads.length === 0) {
    setAds(set.ads);
  }
};

const confirmViewed = () => {
  markAdsViewed();
  router.push({ name: "post-questionnaire" });
};

const selectedSegment = computed(() => segment.value);
const selectedReason = computed(() => reason.value);

onMounted(() => {
  ensureAds();
});
</script>
