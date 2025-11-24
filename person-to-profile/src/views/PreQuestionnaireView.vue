<template>
  <div class="page">
    <section class="card questionnaire-header">
      <p class="section-title">
        <span class="dot" aria-hidden="true"></span>
        <span>Participant profile</span>
      </p>
      <h1 class="questionnaire-title">Tell us a little about you</h1>
      <p class="questionnaire-lede">
        This helps us select ads that map to your audience segment. Answers are
        only used to pick creatives for this session.
      </p>
    </section>

    <section class="card questionnaire-grid">
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
        :placeholder="question.placeholder"
        :required="question.required"
        class="question-card"
      />

      <div class="form-actions">
        <button
          class="btn"
          type="button"
          :disabled="!isComplete"
          @click="submit"
        >
          See my ads
        </button>
        <span class="muted">Your answers stay within this session.</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import DropDownQuestion from "@/components/questions/DropDownQuestion.vue";
import NumberQuestion from "@/components/questions/NumberQuestion.vue";
import PostCodeQuestion from "@/components/questions/PostCodeQuestion.vue";
import SliderQuestion from "@/components/questions/SliderQuestion.vue";
import TextQuestion from "@/components/questions/TextQuestion.vue";
import { useSurveyState, type DemographicAnswers } from "@/lib/surveyState";

type Question = {
  id: number;
  label: string;
  field: keyof DemographicAnswers;
  type: "dropdown" | "number" | "postcode" | "slider" | "text";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  helper?: string;
  placeholder?: string;
  required?: boolean;
};

const router = useRouter();
const { state, savePreAnswers } = useSurveyState();

const questions: Question[] = [
  {
    id: 1,
    label: "What is your gender?",
    field: "gender",
    type: "dropdown",
    options: ["Female", "Male", "Non-binary", "Prefer not to say"],
    required: true,
  },
  {
    id: 2,
    label: "What is your age?",
    field: "age",
    type: "number",
    min: 16,
    max: 100,
    required: true,
  },
  {
    id: 3,
    label: "Which ethnicity best describes you?",
    field: "ethnicity",
    type: "dropdown",
    options: [
      "Asian / Asian British",
      "Black / African / Caribbean / Black British",
      "Mixed / Multiple ethnic groups",
      "White",
      "Other",
      "Prefer not to say",
    ],
    required: true,
  },
  {
    id: 4,
    label: "What is your occupation?",
    field: "occupation",
    type: "text",
    placeholder: "e.g. Marketing manager, Student, Nurse",
    required: true,
  },
  {
    id: 5,
    label: "What is your postcode?",
    field: "postcode",
    type: "postcode",
    helper:
      "We only use this to place you into a broad region. No addresses are stored.",
    required: true,
  },
  {
    id: 6,
    label: "What is your annual household income?",
    field: "income",
    type: "dropdown",
    options: [
      "Below £20k",
      "£20k-£50k",
      "£50k-£80k",
      "£80k-£120k",
      "Above £120k",
      "Prefer not to say",
    ],
    required: true,
  },
  {
    id: 7,
    label: "What is your highest level of education?",
    field: "education",
    type: "dropdown",
    options: [
      "GCSEs",
      "A-Levels",
      "Bachelor's degree",
      "Master's degree",
      "Doctorate",
      "Other",
      "Prefer not to say",
    ],
    required: true,
  },
  {
    id: 8,
    label: "How often do you notice ads in a typical week?",
    field: "adFrequency",
    type: "slider",
    min: 0,
    max: 20,
    step: 1,
    helper: "0 = never, 20 = constantly",
  },
];

const answers = reactive<DemographicAnswers>({
  gender: state.preAnswers.gender ?? "",
  age: state.preAnswers.age ?? null,
  ethnicity: state.preAnswers.ethnicity ?? "",
  occupation: state.preAnswers.occupation ?? "",
  postcode: state.preAnswers.postcode ?? "",
  income: state.preAnswers.income ?? "",
  education: state.preAnswers.education ?? "",
  adFrequency: state.preAnswers.adFrequency ?? 6,
});

const requiredFields: (keyof DemographicAnswers)[] = [
  "gender",
  "age",
  "ethnicity",
  "occupation",
  "postcode",
  "income",
  "education",
];

const isComplete = computed(() =>
  requiredFields.every((field) => {
    const value = answers[field];
    return (
      value !== undefined && value !== null && String(value).trim().length > 0
    );
  })
);

const componentForType: Record<Question["type"], unknown> = {
  dropdown: DropDownQuestion,
  number: NumberQuestion,
  postcode: PostCodeQuestion,
  slider: SliderQuestion,
  text: TextQuestion,
};

const submit = () => {
  if (!isComplete.value) return;
  savePreAnswers({ ...answers, age: answers.age ?? null });
  router.push({ name: "content" });
};
</script>
