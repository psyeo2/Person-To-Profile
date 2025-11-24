import { reactive } from 'vue'

export const SURVEY_PASSWORD = '123'

export type DemographicAnswers = {
  gender?: string
  age?: number | null
  ethnicity?: string
  occupation?: string
  postcode?: string
  income?: string
  education?: string
  adFrequency?: number | null
}

export type PostSurveyAnswers = {
  relevance?: number | null
  favouriteAd?: string
  consideration?: number | null
  recall?: number | null
  takeaway?: string
}

export type SelectedAd = {
  id: string
  name: string
  headline: string
  copy: string
  badge: string
  angle: string
}

const state = reactive({
  isAuthenticated: false,
  hasSubmittedPre: false,
  hasSeenAds: false,
  hasCompletedPost: false,
  preAnswers: {} as DemographicAnswers,
  postAnswers: {} as PostSurveyAnswers,
  ads: [] as SelectedAd[],
})

export function useSurveyState() {
  const setAuthenticated = (value: boolean) => {
    state.isAuthenticated = value
  }

  const savePreAnswers = (answers: DemographicAnswers) => {
    state.preAnswers = { ...answers }
    state.hasSubmittedPre = true
    state.hasSeenAds = false
    state.ads = []
  }

  const markAdsViewed = () => {
    state.hasSeenAds = true
  }

  const savePostAnswers = (answers: PostSurveyAnswers) => {
    state.postAnswers = { ...answers }
    state.hasCompletedPost = true
  }

  const setAds = (ads: SelectedAd[]) => {
    state.ads = ads
  }

  const resetSession = () => {
    state.isAuthenticated = false
    state.hasSubmittedPre = false
    state.hasSeenAds = false
    state.hasCompletedPost = false
    state.preAnswers = {}
    state.postAnswers = {}
    state.ads = []
  }

  return {
    state,
    setAuthenticated,
    savePreAnswers,
    markAdsViewed,
    savePostAnswers,
    setAds,
    resetSession,
  }
}
