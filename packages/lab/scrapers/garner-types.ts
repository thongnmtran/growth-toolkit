export interface GartnerRoot {
  reviewPaywallFlg: boolean
  availableFilters: AvailableFilters
  userReviews: UserReview[]
  totalCount: number
  pageNum: number
  prevPage: number
  nextPage: number
  totalUnfilteredReviewCount: number
  lockedTagCount: number
  unlockedTagCount: number
  path: string
  endPointVersion: string
  allRequestParameters: AllRequestParameters
}

export interface AvailableFilters {
  deploymentRegion: DeploymentRegion[]
  function: Function[]
  industry: Industry[]
  partnerReview: PartnerReview[]
  companySize: CompanySize[]
  reviewRating: ReviewRating
  products: Product[]
  tags: Tag[]
}

export interface DeploymentRegion {
  id: string
  description: string
  count: number
}

export interface Function {
  id: number
  description: string
  count: number
}

export interface Industry {
  id: number
  description: string
  count: number
}

export interface PartnerReview {
  id: string
  description: string
  count: number
}

export interface CompanySize {
  id: number
  description: string
  count: number
}

export interface ReviewRating {
  "2": number
  "3": number
  "4": number
  "5": number
}

export interface Product {
  id: number
  description: string
  count: number
}

export interface Tag {
  id: string
  description: string
  count: number
}

export interface UserReview {
  reviewId: number
  timestamp: number
  formattedReviewDate: string
  reviewSourceCode: number
  reviewIncentiveCode: number
  productNames: string
  reviewRating: number
  industryCd: number
  industryName: string
  companySizeCd: number
  companySize: string
  jobTitle?: string
  reviewSummary: string
  reviewHeadline: string
  upVotes: number
  functionCd: number
  function?: string
  partnerReview: boolean
  tags?: Tag2[]
  productSeoNames: string[]
  vendorSeoName: string
  sortValue: number
}

export interface Tag2 {
  highlight: string
  displayTag: string
  question: string
}

export interface AllRequestParameters {
  vendorSeoName: string
  marketSeoName: string
  productSeoName: string
  startIndex: string
  endIndex: string
  filters: string
  sort: string
}

// =================================================================================================================
// =================================================================================================================
// =================================================================================================================


export interface DetailedReviewRoot {
  props: Props
  page: string
  query: Query2
  buildId: string
  assetPrefix: string
  isFallback: boolean
  gssp: boolean
  customServer: boolean
  scriptLoader: any[]
}

export interface Props {
  pageProps: PageProps
  __N_SSP: boolean
}

export interface PageProps {
  serverSideXHRData: ServerSideXhrdata
  isStatic: boolean
  query: Query
  params: Params
  windowGlobals: WindowGlobals
  cssFilenames: string[]
  stylesheets: string[]
  userSpaRouteKey: string
  viewType: string
  isAdmin: boolean
  showLinkedinLogin: boolean
  environment: string
  useNextJSStyleSheet: boolean
}

export interface ServerSideXhrdata {
  flagsAndPermissions: FlagsAndPermissions
  pageData: PageData
  pageInfo: PageInfo
  hash: string
  jqueryHash: string
  gcrowd2Hash: string
  getReviewPresentation: GetReviewPresentation
  dci: Dci
  allResponsesAreValid: boolean
}

export interface FlagsAndPermissions {
  "new-dashboard": boolean
  ReferTabSocialInviteShowFlag: boolean
  "vendor-pledge": boolean
  "disable-paste-in-survey": boolean
  "partner-coi-prompt": boolean
  "review-snippet": boolean
  "MC-Incentives-On": boolean
  "likes-dislikes-content": boolean
  "vp-search-delay": boolean
  "review-collection-enable-flag": boolean
  "unified-profile": boolean
  "alternatives-page-new": boolean
  "auto-vendor-profile": boolean
  disallow_registration_without_token: boolean
  "vendor-profile-project": boolean
  "partner-reviews-flag": boolean
  "listing-guidelines": boolean
  "buysmart-button": boolean
  "pi-plus-resource-center": boolean
  "process-vendor-product-profile-request": boolean
  "multi-currency-reward-link-flag": boolean
  "vendor-engagement-intercom-flag": boolean
  "alternative-page-feature-flag": boolean
  "new-access-form-flows": boolean
  ReferTabResendInviteShowFlag: boolean
  "new-thank-you-page-enable": boolean
  "add-profile-addnl-fields": boolean
  "vendor-compare-feature-flag": boolean
  next_js_for_vendor_product: boolean
  "pi-readership-analytics": boolean
  "cc-winners-page": boolean
  "tpt-modernisation": boolean
  "pi-discovery-pro": boolean
  "es-mvp-search": boolean
  "Promo-Incentives-On": boolean
  ReferTabEmailInviteShowFlag: boolean
  "new-vendor-product-landing-page": boolean
}

export interface PageData {
  hash: string
  addOneTrust: boolean
}

export interface PageInfo {
  image: string
  redirectURL: any
  canonicalUrl: any
  showComparePDF: boolean
  metaDesc: string
  link: string
  notFound: boolean
  noIndexFlag: boolean
  title: string
  follow: boolean
}

export interface GetReviewPresentation {
  userEditEligible: boolean
  review: Review
  isAdmin: boolean
  voteEligible: boolean
}

export interface Review {
  headline: string
  summary: string
  submitDate: string
  submitTimestamp: number
  rating: number
  source: string
  upvote: number
  downvote: number
  deploymentArchitecture: string
  partnerReview: boolean
  user: User
  market?: Market
  vendor?: Vendor
  products?: Product[]
  sections?: Section[]
}

export interface User {
  id: number
  title: string
  industry: string
  companySize: string
  function: string
}

export interface Market {
  id: number
  name: string
  seoName: string
}

export interface Vendor {
  id: number
  name: string
  seoName: string
}

export interface Product {
  id: number
  name: string
  seoName: string
  subscribed: boolean
  legacy: boolean
}

export interface Section {
  id: number
  title: string
  questions?: Question[]
  slug?: string
  ratingKey?: string
  ratingValue?: string
}

export interface Question {
  key: string
  title: string
  value: string
  type: string
}

export interface Dci {
  injections: any[]
}

export interface Query {
  marketSeoName: string
  vendorSeoName: string
  productSeoName: string
  reviewId: string
}

export interface Params {
  marketSeoName: string
  vendorSeoName: string
  productSeoName: string
  reviewId: string
}

export interface WindowGlobals {
  isLoggedIn: boolean
  botRequest: boolean
  generatingPDF: boolean
  isDev: boolean
  enableDelayedScripts: boolean
  href: string
  pathname: string
  search: string
  isPartialLoggedIn: boolean
  flagsAndPermissions: FlagsAndPermissions2
}

export interface FlagsAndPermissions2 {
  "new-dashboard": boolean
  ReferTabSocialInviteShowFlag: boolean
  "vendor-pledge": boolean
  "disable-paste-in-survey": boolean
  "partner-coi-prompt": boolean
  "review-snippet": boolean
  "MC-Incentives-On": boolean
  "likes-dislikes-content": boolean
  "vp-search-delay": boolean
  "review-collection-enable-flag": boolean
  "unified-profile": boolean
  "alternatives-page-new": boolean
  "auto-vendor-profile": boolean
  disallow_registration_without_token: boolean
  "vendor-profile-project": boolean
  "partner-reviews-flag": boolean
  "listing-guidelines": boolean
  "buysmart-button": boolean
  "pi-plus-resource-center": boolean
  "process-vendor-product-profile-request": boolean
  "multi-currency-reward-link-flag": boolean
  "vendor-engagement-intercom-flag": boolean
  "alternative-page-feature-flag": boolean
  "new-access-form-flows": boolean
  ReferTabResendInviteShowFlag: boolean
  "new-thank-you-page-enable": boolean
  "add-profile-addnl-fields": boolean
  "vendor-compare-feature-flag": boolean
  next_js_for_vendor_product: boolean
  "pi-readership-analytics": boolean
  "cc-winners-page": boolean
  "tpt-modernisation": boolean
  "pi-discovery-pro": boolean
  "es-mvp-search": boolean
  "Promo-Incentives-On": boolean
  ReferTabEmailInviteShowFlag: boolean
  "new-vendor-product-landing-page": boolean
}

export interface Query2 {
  marketSeoName: string
  vendorSeoName: string
  productSeoName: string
  reviewId: string
}
