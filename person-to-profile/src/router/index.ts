import { createRouter, createWebHistory } from "vue-router";
import { setPageTitle } from "@/lib/title";
import { useSurveyState } from "@/lib/surveyState";
import { routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const { state } = useSurveyState();

  if (to.meta.requiresAuth && !state.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresPre && !state.hasSubmittedPre) {
    return { name: "pre-questionnaire" };
  }

  if (to.meta.requiresAds && !state.hasSeenAds) {
    return { name: "content" };
  }

  return true;
});

router.afterEach((to) => {
  setPageTitle(typeof to.meta.title === "string" ? to.meta.title : undefined);
});

export default router;
