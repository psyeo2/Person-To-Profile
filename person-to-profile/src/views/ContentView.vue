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
          <img
            class="ad-image"
            :src="ad.file"
            :alt="`${ad.name} creative`"
            loading="lazy"
          />
          <div class="ad-meta">
            <h3 class="ad-title">{{ ad.name }}</h3>
            <p class="muted">Match score: {{ ad.score ?? 0 }}</p>
          </div>
        </article>
      </div>
      <p v-else-if="loadingAds" class="muted">We are preparing your ads...</p>
      <p v-else class="muted">No ads available yet. Please adjust your answers.</p>
      <p v-if="adError" class="error-text">{{ adError }}</p>

      <div class="ads-actions">
        <button class="btn" type="button" @click="confirmViewed">
          I've viewed both ads
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
import { postcodeToCounty } from "@/lib/postcodeToCounty";
import { setAdsShown } from "@/api";

type AdMeta = {
  id: string;
  file: string;
  tags: Record<string, string[]>;
};

type AudienceTags = {
  gender?: string;
  age?: string;
  ethnicity?: string;
  occupation?: string;
  postcode?: string;
  income?: string;
  education_level?: string;
};

const router = useRouter();
const { state, setAds, markAdsViewed } = useSurveyState();
const segment = ref("General audience");
const reason = ref("Default blend while we learn more about this profile.");
const loadingAds = ref(false);
const adError = ref("");

const formatName = (id: string) =>
  id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const deriveRegion = (postcode: string | undefined) => {
  if (!postcode) return undefined;
  const area = postcode.trim().toUpperCase().match(/^[A-Z]{1,2}/)?.[0];
  return area ? postcodeToCounty[area] ?? undefined : undefined;
};

const normaliseGender = (value?: string) => {
  if (!value) return undefined;
  const g = value.toLowerCase();
  if (g.includes("female")) return "female";
  if (g.includes("male")) return "male";
  if (g.includes("non")) return "nonbinary";
  if (g.includes("prefer")) return "prefer_not_to_say";
  return undefined;
};

const ageBand = (age?: number | null) => {
  if (!age) return undefined;
  if (age < 18) return "under_18";
  if (age <= 24) return "18_24";
  if (age <= 34) return "25_34";
  if (age <= 49) return "35_49";
  if (age <= 64) return "50_64";
  return "65_plus";
};

const normaliseEthnicity = (value?: string) => {
  if (!value) return undefined;
  const e = value.toLowerCase();
  if (e.includes("white")) return "white";
  if (e.includes("asian")) return "asian";
  if (e.includes("black")) return "black";
  if (e.includes("mixed")) return "mixed";
  if (e.includes("other")) return "other";
  return undefined;
};

const normaliseOccupation = (value?: string) => {
  if (!value) return undefined;
  const job = value.toLowerCase();
  if (job.includes("student")) return "student";
  if (job.includes("retired")) return "retired";
  if (job.includes("unemployed")) return "unemployed";
  if (job.includes("labour") || job.includes("driver") || job.includes("builder")) {
    return "manual_labour";
  }
  if (
    job.includes("engineer") ||
    job.includes("manager") ||
    job.includes("consultant") ||
    job.includes("director") ||
    job.includes("analyst") ||
    job.includes("developer")
  ) {
    return "professional";
  }
  return "other";
};

const normaliseIncome = (value?: string) => {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("below") || lower.includes("20k-") || lower.includes("20k")) return "low";
  if (lower.includes("50k-") || lower.includes("80k") || lower.includes("middle")) return "middle";
  if (lower.includes("above") || lower.includes("120k") || lower.includes("high")) return "high";
  return undefined;
};

const normaliseEducation = (value?: string) => {
  if (!value) return undefined;
  const edu = value.toLowerCase();
  if (edu.includes("gcse")) return "gcse";
  if (edu.includes("level")) return "a_level";
  if (edu.includes("bachelor") || edu.includes("undergraduate")) return "undergraduate";
  if (edu.includes("master") || edu.includes("postgraduate")) return "postgraduate";
  if (edu.includes("doctorate") || edu.includes("phd")) return "doctorate";
  if (edu.includes("other")) return "other";
  return undefined;
};

const buildAudienceTags = (answers: DemographicAnswers): AudienceTags => ({
  gender: normaliseGender(answers.gender),
  age: ageBand(answers.age ?? null),
  ethnicity: normaliseEthnicity(answers.ethnicity),
  occupation: normaliseOccupation(answers.occupation),
  postcode: deriveRegion(answers.postcode),
  income: normaliseIncome(answers.income),
  education_level: normaliseEducation(answers.education),
});

const fetchAdMetadata = async (): Promise<AdMeta[]> => {
  const manifestRes = await fetch("/ad-content/meta/manifest.json");
  if (!manifestRes.ok) {
    throw new Error("Unable to load ads manifest.");
  }
  const files = (await manifestRes.json()) as string[];

  const ads: AdMeta[] = [];
  for (const file of files) {
    const res = await fetch(`/ad-content/meta/${file}`);
    if (!res.ok) {
      throw new Error(`Unable to load ad metadata for ${file}`);
    }
    ads.push(await res.json());
  }

  return ads;
};

const scoreAds = (metadata: AdMeta[], tags: AudienceTags) => {
  const scored = metadata.map((meta) => {
    let score = 0;
    const matchedTags: string[] = [];

    Object.entries(tags).forEach(([key, value]) => {
      if (!value) return;
      const tagList = meta.tags?.[key];
      if (Array.isArray(tagList) && tagList.includes(value)) {
        score += 1;
        matchedTags.push(`${key}:${value}`);
      }
    });

    return { meta, score, matchedTags };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
};

const pickTopAds = (metadata: AdMeta[], tags: AudienceTags): SelectedAd[] => {
  const scored = scoreAds(metadata, tags);
  const selections = scored.slice(0, 2).map((item) => ({
    id: item.meta.id,
    name: formatName(item.meta.id),
    file: `/${item.meta.file}`,
    score: item.score,
    matchedTags: item.matchedTags,
  }));

  // If there are fewer than two ads, duplicate the best we have
  if (selections.length === 1 && metadata.length === 1) {
    const only = selections[0];
    if (only) {
      selections.push({ ...only, id: `${only.id}-b` });
    }
  }

  return selections;
};

const ensureAds = async () => {
  loadingAds.value = true;
  adError.value = "";

  try {
    const metadata = await fetchAdMetadata();
    const audienceTags = buildAudienceTags(state.preAnswers);
    const selections = pickTopAds(metadata, audienceTags);

    setAds(selections);
    segment.value = "Matched selection";
    const bestMatches = selections[0]?.matchedTags ?? [];
    reason.value =
      bestMatches.length > 0
        ? `Weighted by ${bestMatches.slice(0, 3).join(", ").replace(/_/g, " ")}`
        : "Closest fit across available creatives.";

    if (state.participantId && selections.length) {
      await setAdsShown(state.participantId, { adIds: selections.map((ad) => ad.id) });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to prepare ads right now.";
    adError.value = message;
  } finally {
    loadingAds.value = false;
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
