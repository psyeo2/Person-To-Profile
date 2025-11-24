<template>
  <div class="page">
    <section class="card questionnaire-header">
      <p class="section-title">
        <span class="dot" aria-hidden="true"></span>
        <span>Follow-up</span>
      </p>
      <h1 class="questionnaire-title">Tell us how the ads landed</h1>
      <p class="questionnaire-lede">
        Your immediate impressions help us understand which messages resonate
        with your audience segment.
      </p>
    </section>

    <section v-if="!submitted" class="card questionnaire-grid">
      <component
        :is="componentForType[question.type]"
        v-for="question in questions"
        :key="question.id"
        v-model="answers[question.field]"
        :label="question.label"
        :options="question.options"
        :min="question.min"
        :max="question.max"
        :step="question.step"
        :helper="question.helper"
        :required="question.required"
        class="question-card"
      />

      <div class="form-actions">
        <button
          class="btn"
          type="button"
          :disabled="!isComplete || submitting"
          @click="submit"
        >
          {{ submitting ? "Submitting..." : "Submit feedback" }}
        </button>
        <span class="muted">No personal identifiers are stored.</span>
      </div>
      <p v-if="submitError" class="error-text">{{ submitError }}</p>
    </section>

    <section v-else class="card completion-card">
      <h2>Thank you for your feedback</h2>
      <p>
        We appreciate your time. You can close this tab or restart if you'd like
        to try again.
      </p>
      <div class="form-actions" style="justify-content: center">
        <button class="btn" type="button" @click="restart">Restart the study</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import DropDownQuestion from "@/components/questions/DropDownQuestion.vue";
import SliderQuestion from "@/components/questions/SliderQuestion.vue";
import TextQuestion from "@/components/questions/TextQuestion.vue";
import { useSurveyState, type PostSurveyAnswers } from "@/lib/surveyState";
import { setSurveyAnswers } from "@/api";

type QuestionType = "dropdown" | "slider" | "text";

type Question = {
  id: number;
  label: string;
  field: keyof PostSurveyAnswers;
  type: QuestionType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  helper?: string;
  required?: boolean;
};

const router = useRouter();
const { state, savePostAnswers, resetSession } = useSurveyState();
const submitted = ref(false);
const submitting = ref(false);
const submitError = ref("");

const answers = reactive<PostSurveyAnswers>({
  relevance: state.postAnswers.relevance ?? 3,
  favouriteAd: state.postAnswers.favouriteAd ?? "",
  consideration: state.postAnswers.consideration ?? 5,
  recall: state.postAnswers.recall ?? 5,
  takeaway: state.postAnswers.takeaway ?? "",
});

const adOptions = computed(() => {
  if (state.ads.length === 0) {
    return ["Ad A", "Ad B"];
  }
  return state.ads.map((ad) => ad.name);
});

const questions = computed<Question[]>(() => [
  {
    id: 1,
    label: "How relevant did these ads feel to you?",
    field: "relevance",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
    helper: "1 = not at all, 5 = extremely relevant",
    required: true,
  },
  {
    id: 2,
    label: "Which ad resonated more?",
    field: "favouriteAd",
    type: "dropdown",
    options: adOptions.value,
    required: true,
  },
  {
    id: 3,
    label: "How likely are you to act on either ad?",
    field: "consideration",
    type: "slider",
    min: 0,
    max: 10,
    step: 1,
    helper: "0 = not at all, 10 = ready to act",
    required: true,
  },
  {
    id: 4,
    label: "How memorable were the visuals or message?",
    field: "recall",
    type: "slider",
    min: 0,
    max: 10,
    step: 1,
    helper: "0 = forgettable, 10 = highly memorable",
    required: true,
  },
  {
    id: 5,
    label: "What stood out most and why?",
    field: "takeaway",
    type: "text",
    helper: "Short, honest notes are perfect.",
    required: true,
  },
]);

const isComplete = computed(() => {
  if (!answers.takeaway || answers.takeaway.trim().length === 0) return false;
  return (
    answers.relevance !== null &&
    answers.consideration !== null &&
    answers.recall !== null &&
    (answers.favouriteAd ?? "").toString().length > 0
  );
});

const componentForType: Record<QuestionType, unknown> = {
  dropdown: DropDownQuestion,
  slider: SliderQuestion,
  text: TextQuestion,
};

const submit = () => {
  if (!isComplete.value || submitting.value) return;
  if (!state.participantId) {
    submitError.value = "Missing participant id for this session.";
    return;
  }

  submitError.value = "";
  submitting.value = true;

  const payload = {
    relevance: Number(answers.relevance ?? 0),
    favouriteAd: answers.favouriteAd || "",
    consideration: Number(answers.consideration ?? 0),
    recall: Number(answers.recall ?? 0),
    takeaway: answers.takeaway || "",
  };

  setSurveyAnswers(state.participantId, payload)
    .then(() => {
      savePostAnswers(payload);
      submitted.value = true;
    })
    .catch((err) => {
      const message =
        err instanceof Error ? err.message : "Unable to save your feedback.";
      submitError.value = message;
    })
    .finally(() => {
      submitting.value = false;
    });
};

const restart = () => {
  resetSession();
  router.push({ name: "home" });
};
</script>
