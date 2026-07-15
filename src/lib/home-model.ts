import type { ExperienceItem, FeaturedItem, WritingItem } from "./profile";

export interface HomePageModel {
  readonly brand: string;
  readonly monogram: string;
  readonly title: string;
  readonly headline: string;
  readonly subhead: string;
  readonly location: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly signals: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly about: readonly string[];
  readonly experience: readonly ExperienceItem[];
  readonly education: {
    readonly school: string;
    readonly degree: string;
    readonly period: string;
    readonly notes: readonly string[];
  };
  readonly featured: readonly FeaturedItem[];
  readonly writing: readonly WritingItem[];
  readonly primaryCta: { readonly label: string; readonly href: string };
  readonly secondaryCta: { readonly label: string; readonly href: string };
  readonly tertiaryCta: { readonly label: string; readonly href: string };
}

export function buildHomePageModel(profile: {
  readonly shortName: string;
  readonly monogram: string;
  readonly title: string;
  readonly headline: string;
  readonly subhead: string;
  readonly location: string;
  readonly photoSrc: string;
  readonly photoAlt: string;
  readonly signals: readonly string[];
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  readonly skills: readonly string[];
  readonly about: readonly string[];
  readonly experience: readonly ExperienceItem[];
  readonly education: HomePageModel["education"];
  readonly featured: readonly FeaturedItem[];
  readonly writing: readonly WritingItem[];
  readonly links: {
    readonly linkedin: string;
    readonly medium: string;
    readonly navigara: string;
  };
}): HomePageModel {
  return {
    brand: profile.shortName,
    monogram: profile.monogram,
    title: profile.title,
    headline: profile.headline,
    subhead: profile.subhead,
    location: profile.location,
    photoSrc: profile.photoSrc,
    photoAlt: profile.photoAlt,
    signals: profile.signals,
    stats: profile.stats,
    skills: profile.skills,
    about: profile.about,
    experience: profile.experience,
    education: profile.education,
    featured: profile.featured,
    writing: profile.writing,
    primaryCta: { label: "View work", href: "#work" },
    secondaryCta: {
      label: "Connect on LinkedIn",
      href: profile.links.linkedin,
    },
    tertiaryCta: { label: "Navigara", href: profile.links.navigara },
  };
}
