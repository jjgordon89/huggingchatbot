import { Message as VChatMessage } from "ai";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  label?: string;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavLink[];
    }
);

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
};

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

export type MarketingConfig = {
  mainNav: MainNavItem[];
};

export type SubscriptionPlan = {
  name: string;
  description: string;
  features: string[];
  quota: number;
  pagesPerPdf: number;
  price: {
    amount: number;
    priceIds: {
      test: string;
      production: string;
    };
  };
};

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, "stripeCustomerId" | "stripeSubscriptionId"> & {
    stripeCurrentPeriodEnd: number;
    isPro: boolean;
  };

export const Icons = {
  arrowDown: "arrow-down",
  arrowRight: "arrow-right",
  check: "check",
  close: "close",
  copy: "copy",
  external: "external",
  github: "github",
  mail: "mail",
  messageSquare: "message-square",
  spinner: "spinner",
  trash: "trash",
  twitter: "twitter",
  upload: "upload",
  wave: "wave",
  move: "move",
  folder: "folder",
  document: "document",
  bell: "bell",
  settings: "settings",
  creditCard: "credit-card",
  plus: "plus",
  moon: "moon",
  sun: "sun",
  layoutDashboard: "layout-dashboard",
  helpCircle: "help-circle",
  compass: "compass",
  book: "book",
  video: "video",
  music: "music",
  code: "code",
  terminal: "terminal",
  image: "image",
  api: "api",
  logOut: "log-out",
  users: "users",
  file: "file",
  box: "box",
  shoppingCart: "shopping-cart",
  star: "star",
  refreshCw: "refresh-cw",
  search: "search",
  filter: "filter",
  chevronDown: "chevron-down",
  chevronUp: "chevron-up",
  chevronLeft: "chevron-left",
  chevronRight: "chevron-right",
  moreHorizontal: "more-horizontal",
  moreVertical: "more-vertical",
  gripVertical: "grip-vertical",
  gripHorizontal: "grip-horizontal",
  menu: "menu",
  alignLeft: "align-left",
  alignCenter: "align-center",
  alignRight: "align-right",
  bold: "bold",
  italic: "italic",
  underline: "underline",
  list: "list",
  listOrdered: "list-ordered",
  link: "link",
  imageIcon: "image-icon",
  quote: "quote",
  codeIcon: "code-icon",
  table: "table",
  separator: "separator",
  undo: "undo",
  redo: "redo",
  maximize: "maximize",
  minimize: "minimize",
  copyPlus: "copy-plus",
  checkCircle: "check-circle",
  alertTriangle: "alert-triangle",
  info: "info",
  warning: "warning",
  error: "error",
  success: "success",
  loader2: "loader2",
  calendar: "calendar",
  clock: "clock",
  mailOpen: "mail-open",
  atSign: "at-sign",
  hash: "hash",
  tag: "tag",
  award: "award",
  flag: "flag",
  mapPin: "map-pin",
  phone: "phone",
  printer: "printer",
  mousePointer: "mouse-pointer",
  disc: "disc",
  heart: "heart",
  thumbsUp: "thumbs-up",
  thumbsDown: "thumbs-down",
  share2: "share-2",
  download: "download",
  uploadCloud: "upload-cloud",
  bookmark: "bookmark",
  eye: "eye",
  eyeOff: "eye-off",
  volume1: "volume-1",
  volume2: "volume-2",
  volumeX: "volume-x",
  mic: "mic",
  micOff: "mic-off",
  camera: "camera",
  cameraOff: "camera-off",
  cast: "cast",
  tv: "tv",
  monitor: "monitor",
  smartphone: "smartphone",
  tablet: "tablet",
  batteryCharging: "battery-charging",
  batteryFull: "battery-full",
  wifi: "wifi",
  bluetooth: "bluetooth",
  database: "database",
  server: "server",
  cpu: "cpu",
  memory: "memory",
  hardDrive: "hard-drive",
  rocket: "rocket",
  shield: "shield",
  lock: "lock",
  unlock: "unlock",
  key: "key",
  wrench: "wrench",
  hammer: "hammer",
  scissors: "scissors",
  paintbrush: "paintbrush",
  palette: "palette",
  ruler: "ruler",
  compass2: "compass-2",
  target: "target",
  zap: "zap",
  flame: "flame",
  cloud: "cloud",
  cloudRain: "cloud-rain",
  cloudSnow: "cloud-snow",
  cloudLightning: "cloud-lightning",
  sunIcon: "sun-icon",
  moonIcon: "moon-icon",
  starIcon: "star-icon",
  arrowUpRight: "arrow-up-right",
  arrowDownLeft: "arrow-down-left",
  plusCircle: "plus-circle",
  minusCircle: "minus-circle",
  xCircle: "x-circle",
  questionMarkCircle: "question-mark-circle",
  alertCircle: "alert-circle",
  checkCircle2: "check-circle2",
  chevronLeftSquare: "chevron-left-square",
  chevronRightSquare: "chevron-right-square",
  chevronUpSquare: "chevron-up-square",
  chevronDownSquare: "chevron-down-square",
  cornerUpLeft: "corner-up-left",
  cornerUpRight: "corner-up-right",
  cornerDownLeft: "corner-down-left",
  cornerDownRight: "corner-down-right",
  cornerLeftUp: "corner-left-up",
  cornerLeftDown: "corner-left-down",
  cornerRightUp: "corner-right-up",
  cornerRightDown: "corner-right-down",
  gitBranch: "git-branch",
  gitCommit: "git-commit",
  gitMerge: "git-merge",
  gitPullRequest: "git-pull-request",
  githubIcon: "github-icon",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  dribbble: "dribbble",
  behance: "behance",
  figma: "figma",
  slack: "slack",
  discord: "discord",
  reddit: "reddit",
  linkedin: "linkedin",
  youtube: "youtube",
  twitch: "twitch",
  vimeo: "vimeo",
  medium: "medium",
  podcast: "podcast",
  rss: "rss",
  wifiIcon: "wifi-icon",
  bluetoothIcon: "bluetooth-icon",
  databaseIcon: "database-icon",
  serverIcon: "server-icon",
  cpuIcon: "cpu-icon",
  memoryIcon: "memory-icon",
  hardDriveIcon: "hard-drive-icon",
  rocketIcon: "rocket-icon",
  shieldIcon: "shield-icon",
  lockIcon: "lock-icon",
  unlockIcon: "unlock-icon",
  keyIcon: "key-icon",
  wrenchIcon: "wrench-icon",
  hammerIcon: "hammer-icon",
  scissorsIcon: "scissors-icon",
  paintbrushIcon: "paintbrush-icon",
  paletteIcon: "palette-icon",
  rulerIcon: "ruler-icon",
  compassIcon: "compass-icon",
  targetIcon: "target-icon",
  zapIcon: "zap-icon",
  flameIcon: "flame-icon",
  cloudIcon: "cloud-icon",
  cloudRainIcon: "cloud-rain-icon",
  cloudSnowIcon: "cloud-snow-icon",
  cloudLightningIcon: "cloud-lightning-icon",
  sunBold: "sun-bold",
  moonBold: "moon-bold",
  starBold: "star-bold",
  arrowUpRightSquare: "arrow-up-right-square",
  arrowDownLeftSquare: "arrow-down-left-square",
  plusSquare: "plus-square",
  minusSquare: "minus-square",
  xSquare: "x-square",
  questionMarkSquare: "question-mark-square",
  alertSquare: "alert-square",
  checkSquare: "check-square",
  chevronLeftCircle: "chevron-left-circle",
  chevronRightCircle: "chevron-right-circle",
  chevronUpCircle: "chevron-up-circle",
  chevronDownCircle: "chevron-down-circle",
  cornerUpLeftSquare: "corner-up-left-square",
  cornerUpRightSquare: "corner-up-right-square",
  cornerDownLeftSquare: "corner-down-left-square",
  cornerDownRightSquare: "corner-down-right-square",
  cornerLeftUpSquare: "corner-left-up-square",
  cornerLeftDownSquare: "corner-left-down-square",
  cornerRightUpSquare: "corner-right-up-square",
  cornerRightDownSquare: "corner-right-down-square",
  gitBranchSquare: "git-branch-square",
  gitCommitSquare: "git-commit-square",
  gitMergeSquare: "git-merge-square",
  gitPullRequestSquare: "git-pull-request-square",
  githubSquare: "github-square",
  gitlabSquare: "gitlab-square",
  bitbucketSquare: "bitbucket-square",
  dribbbleSquare: "dribbble-square",
  behanceSquare: "behance-square",
  figmaSquare: "figma-square",
  slackSquare: "slack-square",
  discordSquare: "discord-square",
  redditSquare: "reddit-square",
  linkedinSquare: "linkedin-square",
  youtubeSquare: "youtube-square",
  twitchSquare: "twitch-square",
  vimeoSquare: "vimeo-square",
  mediumSquare: "medium-square",
  podcastSquare: "podcast-square",
  rssSquare: "rss-square",
  wifiSquare: "wifi-square",
  bluetoothSquare: "bluetooth-square",
  databaseSquare: "database-square",
  serverSquare: "server-square",
  cpuSquare: "cpu-square",
  memorySquare: "memory-square",
  hardDriveSquare: "hard-drive-square",
  rocketSquare: "rocket-square",
  shieldSquare: "shield-square",
  lockSquare: "lock-square",
  unlockSquare: "unlock-square",
  keySquare: "key-square",
  wrenchSquare: "wrench-square",
  hammerSquare: "hammer-square",
  scissorsSquare: "scissors-square",
  paintbrushSquare: "paintbrush-square",
  paletteSquare: "palette-square",
  rulerSquare: "ruler-square",
  compassSquare: "compass-square",
  targetSquare: "target-square",
  zapSquare: "zap-square",
  flameSquare: "flame-square",
  cloudSquare: "cloud-square",
  cloudRainSquare: "cloud-rain-square",
  cloudSnowSquare: "cloud-snow-square",
  cloudLightningSquare: "cloud-lightning-square",
  sunBoldSquare: "sun-bold-square",
  moonBoldSquare: "moon-bold-square",
  starBoldSquare: "star-bold-square",
  arrowUpRightCircle: "arrow-up-right-circle",
  arrowDownLeftCircle: "arrow-down-left-circle",
  plusCircleSquare: "plus-circle-square",
  minusCircleSquare: "minus-circle-square",
  xCircleSquare: "x-circle-square",
  questionMarkCircleSquare: "question-mark-circle-square",
  alertCircleSquare: "alert-circle-square",
  checkCircleSquare: "check-circle-square",
  chevronLeftDiamond: "chevron-left-diamond",
  chevronRightDiamond: "chevron-right-diamond",
  chevronUpDiamond: "chevron-up-diamond",
  chevronDownDiamond: "chevron-down-diamond",
  cornerUpLeftDiamond: "corner-up-left-diamond",
  cornerUpRightDiamond: "corner-up-right-diamond",
  cornerDownLeftDiamond: "corner-down-left-diamond",
  cornerDownRightDiamond: "corner-down-right-diamond",
  cornerLeftUpDiamond: "corner-left-up-diamond",
  cornerLeftDownDiamond: "corner-left-down-diamond",
  cornerRightUpDiamond: "corner-right-up-diamond",
  cornerRightDownDiamond: "corner-right-down-diamond",
  gitBranchDiamond: "git-branch-diamond",
  gitCommitDiamond: "git-commit-diamond",
  gitMergeDiamond: "git-merge-diamond",
  gitPullRequestDiamond: "git-pull-request-diamond",
  githubDiamond: "github-diamond",
  gitlabDiamond: "gitlab-diamond",
  bitbucketDiamond: "bitbucket-diamond",
  dribbbleDiamond: "dribbble-diamond",
  behanceDiamond: "behance-diamond",
  figmaDiamond: "figma-diamond",
  slackDiamond: "slack-diamond",
  discordDiamond: "discord-diamond",
  redditDiamond: "reddit-diamond",
  linkedinDiamond: "linkedin-diamond",
  youtubeDiamond: "youtube-diamond",
  twitchDiamond: "twitch-diamond",
  vimeoDiamond: "vimeo-diamond",
  mediumDiamond: "medium-diamond",
  podcastDiamond: "podcast-diamond",
  rssDiamond: "rss-diamond",
  wifiDiamond: "wifi-diamond",
  bluetoothDiamond: "bluetooth-diamond",
  databaseDiamond: "database-diamond",
  serverDiamond: "server-diamond",
  cpuDiamond: "cpu-diamond",
  memoryDiamond: "memory-diamond",
  hardDriveDiamond: "hard-drive-diamond",
  rocketDiamond: "rocket-diamond",
  shieldDiamond: "shield-diamond",
  lockDiamond: "lock-diamond",
  unlockDiamond: "unlock-diamond",
  keyDiamond: "key-diamond",
  wrenchDiamond: "wrench-diamond",
  hammerDiamond: "hammer-diamond",
  scissorsDiamond: "scissors-diamond",
  paintbrushDiamond: "paintbrush-diamond",
  paletteDiamond: "palette-diamond",
  rulerDiamond: "ruler-diamond",
  compassDiamond: "compass-diamond",
  targetDiamond: "target-diamond",
  zapDiamond: "zap-diamond",
  flameDiamond: "flame-diamond",
  cloudDiamond: "cloud-diamond",
  cloudRainDiamond: "cloud-rain-diamond",
  cloudSnowDiamond: "cloud-snow-diamond",
  cloudLightningDiamond: "cloud-lightning-diamond",
  sunBoldDiamond: "sun-bold-diamond",
  moonBoldDiamond: "moon-bold-diamond",
  starBoldDiamond: "star-bold-diamond",
  arrowUpRightRhombus: "arrow-up-right-rhombus",
  arrowDownLeftRhombus: "arrow-down-left-rhombus",
  plusRhombus: "plus-rhombus",
  minusRhombus: "minus-rhombus",
  xRhombus: "x-rhombus",
  questionMarkRhombus: "question-mark-rhombus",
  alertRhombus: "alert-rhombus",
  checkRhombus: "check-rhombus",
  chevronLeftPentagon: "chevron-left-pentagon",
  chevronRightPentagon: "chevron-right-pentagon",
  chevronUpPentagon: "chevron-up-pentagon",
  chevronDownPentagon: "chevron-down-pentagon",
  cornerUpLeftPentagon: "corner-up-left-pentagon",
  cornerUpRightPentagon: "corner-up-right-pentagon",
  cornerDownLeftPentagon: "corner-down-left-pentagon",
  cornerDownRightPentagon: "corner-down-right-pentagon",
  cornerLeftUpPentagon: "corner-left-up-pentagon",
  cornerLeftDownPentagon: "corner-left-down-pentagon",
  cornerRightUpPentagon: "corner-right-up-pentagon",
  cornerRightDownPentagon: "corner-right-down-pentagon",
  gitBranchPentagon: "git-branch-pentagon",
  gitCommitPentagon: "git-commit-pentagon",
  gitMergePentagon: "git-merge-pentagon",
  gitPullRequestPentagon: "git-pull-request-pentagon",
  githubPentagon: "github-pentagon",
  gitlabPentagon: "gitlab-pentagon",
  bitbucketPentagon: "bitbucket-pentagon",
  dribbblePentagon: "dribbble-pentagon",
  behancePentagon: "behance-pentagon",
  figmaPentagon: "figma-pentagon",
  slackPentagon: "slack-pentagon",
  discordPentagon: "discord-pentagon",
  redditPentagon: "reddit-pentagon",
  linkedinPentagon: "linkedin-pentagon",
  youtubePentagon: "youtube-pentagon",
  twitchPentagon: "twitch-pentagon",
  vimeoPentagon: "vimeo-pentagon",
  mediumPentagon: "medium-pentagon",
  podcastPentagon: "podcast-pentagon",
  rssPentagon: "rss-pentagon",
  wifiPentagon: "wifi-pentagon",
  bluetoothPentagon: "bluetooth-pentagon",
  databasePentagon: "database-pentagon",
  serverPentagon: "server-pentagon",
  cpuPentagon: "cpu-pentagon",
  memoryPentagon: "memory-pentagon",
  hardDrivePentagon: "hard-drive-pentagon",
  rocketPentagon: "rocket-pentagon",
  shieldPentagon: "shield-pentagon",
  lockPentagon: "lock-pentagon",
  unlockPentagon: "unlock-pentagon",
  keyPentagon: "key-pentagon",
  wrenchPentagon: "wrench-pentagon",
  hammerPentagon: "hammer-pentagon",
  scissorsPentagon: "scissors-pentagon",
  paintbrushPentagon: "paintbrush-pentagon",
  palettePentagon: "palette-pentagon",
  rulerPentagon: "ruler-pentagon",
  compassPentagon: "compass-pentagon",
  targetPentagon: "target-pentagon",
  zapPentagon: "zap-pentagon",
  flamePentagon: "flame-pentagon",
  cloudPentagon: "cloud-pentagon",
  cloudRainPentagon: "cloud-rain-pentagon",
  cloudSnowPentagon: "cloud-snow-pentagon",
  cloudLightningPentagon: "cloud-lightning-pentagon",
  sunBoldPentagon: "sun-bold-pentagon",
  moonBoldPentagon: "moon-bold-pentagon",
  starBoldPentagon: "star-bold-pentagon",
  arrowUpRightHexagon: "arrow-up-right-hexagon",
  arrowDownLeftHexagon: "arrow-down-left-hexagon",
  plusHexagon: "plus-hexagon",
  minusHexagon: "minus-hexagon",
  xHexagon: "x-hexagon",
  questionMarkHexagon: "question-mark-hexagon",
  alertHexagon: "alert-hexagon",
  checkHexagon: "check-hexagon",
  chevronLeftOctagon: "chevron-left-octagon",
  chevronRightOctagon: "chevron-right-octagon",
  chevronUpOctagon: "chevron-up-octagon",
  chevronDownOctagon: "chevron-down-octagon",
  cornerUpLeftOctagon: "corner-up-left-octagon",
  cornerUpRightOctagon: "corner-up-right-octagon",
  cornerDownLeftOctagon: "corner-down-left-octagon",
  cornerDownRightOctagon: "corner-down-right-octagon",
  cornerLeftUpOctagon: "corner-left-up-octagon",
  cornerLeftDownOctagon: "corner-left-down-octagon",
  cornerRightUpOctagon: "corner-right-up-octagon",
  cornerRightDownOctagon: "corner-right-down-octagon",
  gitBranchOctagon: "git-branch-octagon",
  gitCommitOctagon: "git-commit-octagon",
  gitMergeOctagon: "git-merge-octagon",
  gitPullRequestOctagon: "git-pull-request-octagon",
  githubOctagon: "github-octagon",
  gitlabOctagon: "gitlab-octagon",
  bitbucketOctagon: "bitbucket-octagon",
  dribbbleOctagon: "dribbble-octagon",
  behanceOctagon: "behance-octagon",
  figmaOctagon: "figma-octagon",
  slackOctagon: "slack-octagon",
  discordOctagon: "discord-octagon",
  redditOctagon: "reddit-octagon",
  linkedinOctagon: "linkedin-octagon",
  youtubeOctagon: "youtube-octagon",
  twitchOctagon: "twitch-octagon",
  vimeoOctagon: "vimeo-octagon",
  mediumOctagon: "medium-octagon",
  podcastOctagon: "podcast-octagon",
  rssOctagon: "rss-octagon",
  wifiOctagon: "wifi-octagon",
  bluetoothOctagon: "bluetooth-octagon",
  databaseOctagon: "database-octagon",
  serverOctagon: "server-octagon",
  cpuOctagon: "cpu-octagon",
  memoryOctagon: "memory-octagon",
  hardDriveOctagon: "hard-drive-octagon",
  rocketOctagon: "rocket-octagon",
  shieldOctagon: "shield-octagon",
  lockOctagon: "lock-octagon",
  unlockOctagon: "unlock-octagon",
  keyOctagon: "key-octagon",
  wrenchOctagon: "wrench-octagon",
  hammerOctagon: "hammer-octagon",
  scissorsOctagon: "scissors-octagon",
  paintbrushOctagon: "paintbrush-octagon",
  paletteOctagon: "palette-octagon",
  rulerOctagon: "ruler-octagon",
  compassOctagon: "compass-octagon",
  targetOctagon: "target-octagon",
  zapOctagon: "zap-octagon",
  flameOctagon: "flame-octagon",
  cloudOctagon: "cloud-octagon",
  cloudRainOctagon: "cloud-rain-octagon",
  cloudSnowOctagon: "cloud-snow-octagon",
  cloudLightningOctagon: "cloud-lightning-octagon",
  sunBoldOctagon: "sun-bold-octagon",
  moonBoldOctagon: "moon-bold-octagon",
  starBoldOctagon: "star-bold-octagon",
  arrowUpRightStar: "arrow-up-right-star",
  arrowDownLeftStar: "arrow-down-left-star",
  plusStar: "plus-star",
  minusStar: "minus-star",
  xStar: "x-star",
  questionMarkStar: "question-mark-star",
  alertStar: "alert-star",
  checkStar: "check-star",
} as const;

export type Icon = keyof typeof Icons;

export interface Message extends VChatMessage {
  id: string;
  timestamp?: string;
  deliveryStatus?: {
    isDelivered: boolean;
    isRead: boolean;
    timestamp: string;
  };
  hasThread?: boolean;
}

export interface ThreadedMessage extends Message {
  hasThread?: boolean;
  threadId?: string;
  parentMessageId?: string;
  sources?: string[] | SourceType[];
}

export type SourceType = {
  id: string;
  text: string;
  type: 'web' | 'document' | 'database' | 'knowledge';
  title?: string;
  url?: string;
  fileType?: string;
  similarity?: number;
  excerpt?: string;
  metadata?: Record<string, any>;
};

export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  contextLength: number;
  strengths: string[];
  apiKeyRequired?: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  maxTokens: number;
}

export interface OllamaModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  contextLength: number;
  strengths: string[];
  apiKeyRequired?: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

export interface OpenAiModel {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  contextLength: number;
  strengths: string[];
  apiKeyRequired?: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

import { LucideProps } from 'lucide-react';
export interface Model {
  id: string;
  name: string;
  description: string;
  category: string;
  provider: string;
  contextLength: number;
  strengths: string[];
  apiKeyRequired?: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}
