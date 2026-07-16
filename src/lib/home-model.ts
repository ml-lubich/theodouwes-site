import type { ExperienceItem, ProjectItem, WritingItem } from "./profile";
import type { SkillCategory } from "./skills";
import { skillCategories } from "./skills";

export interface HomePageModel {
  readonly brand: string;
  readonly monogram: string;
  readonly title: string;
  readonly headline: string;
  readonly subhead: string;
  readonly location: string;
  readonly aboutTitle: string;
  readonly workIntro: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly portraitMeta: string;
  readonly signals: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly skillCategories: readonly SkillCategory[];
  readonly about: readonly string[];
  readonly experience: readonly ExperienceItem[];
  readonly education: {
    readonly school: string;
    readonly degree: string;
    readonly period: string;
    readonly notes: readonly string[];
  };
  readonly projects: readonly ProjectItem[];
  readonly writing: readonly WritingItem[];
  readonly primaryCta: { readonly label: string; readonly href: string };
  readonly secondaryCta: { readonly label: string; readonly href: string };
  readonly tertiaryCta: { readonly label: string; readonly href: string };
  readonly email: string;
  readonly phone: string;
  readonly zeroCopy: string;
  readonly github: string;
  readonly linkedin: string;
  readonly medium: string;
  readonly navigara: string;
}

export function buildHomePageModel(profile: {
  readonly shortName: string;
  readonly monogram: string;
  readonly title: string;
  readonly headline: string;
  readonly subhead: string;
  readonly location: string;
  readonly aboutTitle: string;
  readonly workIntro: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly portraitMeta: string;
  readonly signals: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly about: readonly string[];
  readonly experience: readonly ExperienceItem[];
  readonly education: HomePageModel["education"];
  readonly projects: readonly ProjectItem[];
  readonly writing: readonly WritingItem[];
  readonly links: {
    readonly linkedin: string;
    readonly github: string;
    readonly medium: string;
    readonly navigara: string;
    readonly zeroCopy: string;
    readonly email: string;
    readonly phone: string;
  };
}): HomePageModel {
  return {
    brand: profile.shortName,
    monogram: profile.monogram,
    title: profile.title,
    headline: profile.headline,
    subhead: profile.subhead,
    location: profile.location,
    aboutTitle: profile.aboutTitle,
    workIntro: profile.workIntro,
    photoSrc: profile.photoSrc,
    photoAlt: profile.photoAlt,
    portraitMeta: profile.portraitMeta,
    signals: profile.signals,
    stats: profile.stats,
    skills: profile.skills,
    skillCategories,
    about: profile.about,
    experience: profile.experience,
    education: profile.education,
    projects: profile.projects,
    writing: profile.writing,
    primaryCta: { label: "View work", href: "#work" },
    secondaryCta: {
      label: "Connect on LinkedIn",
      href: profile.links.linkedin,
    },
    tertiaryCta: { label: "Navigara", href: profile.links.navigara },
    email: profile.links.email,
    phone: profile.links.phone,
    zeroCopy: profile.links.zeroCopy,
    github: profile.links.github,
    linkedin: profile.links.linkedin,
    medium: profile.links.medium,
    navigara: profile.links.navigara,
  };
}
