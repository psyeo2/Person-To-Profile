import type { RouteRecordRaw } from "vue-router";

const HomeView = () => import("@/views/HomeView.vue");
const LoginView = () => import("@/views/LoginView.vue");
const PreQuestionnaireView = () => import("@/views/PreQuestionnaireView.vue");
const ContentView = () => import("@/views/ContentView.vue");
const PostQuestionnaireView = () => import("@/views/PostQuestionnaireView.vue");
const NotFoundView = () => import("@/views/NotFoundView.vue");

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { title: "Welcome" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "Access" },
  },
  {
    path: "/questionnaire/pre",
    name: "pre-questionnaire",
    component: PreQuestionnaireView,
    meta: { title: "Profile questionnaire", requiresAuth: true },
  },
  {
    path: "/content",
    name: "content",
    component: ContentView,
    meta: { title: "Ads preview", requiresAuth: true, requiresPre: true },
  },
  {
    path: "/questionnaire/post",
    name: "post-questionnaire",
    component: PostQuestionnaireView,
    meta: {
      title: "Follow-up questionnaire",
      requiresAuth: true,
      requiresPre: true,
      requiresAds: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundView,
    meta: { title: "Not found" },
  },
];
