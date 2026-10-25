import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { developers, aboutContent } from "./about-content";
import type { Developer } from "./about-content";
import "./about.css";

const socialPlatforms = [
  { key: "github", label: "GitHub", path: "M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.9a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8S17.5.9 15 2.6a13 13 0 0 0-6 0C6.5.9 5.3 1.2 5.3 1.2a5 5 0 0 0-.1 3.8 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.2 6.9a3.4 3.4 0 0 0-.9 2.7v3.9" },
  { key: "facebook", label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { key: "instagram", label: "Instagram", path: "" },
] as const;

function validSocialUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch { return undefined; }
}

function DeveloperPortrait({ developer }: { developer: Developer }) {
  const parts = developer.name.trim().split(/\s+/).filter(Boolean);
  const initials = [parts[0]?.[0], parts.length > 1 ? parts.at(-1)?.[0] : ""].join("").toUpperCase();
  return (
    <Avatar className="about-portrait">
      {developer.image && <AvatarImage src={developer.image} alt={`${developer.name}'s portrait`} />}
      <AvatarFallback className="about-initials">{initials || "?"}</AvatarFallback>
    </Avatar>
  );
}

export default function About() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | undefined>(developers[0]);
  return (
    <div className="about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-intro-copy">
          <p className="about-eyebrow">{aboutContent.eyebrow}</p>
          <h1 id="about-title">{aboutContent.title.map(line => <span key={line}>{line}</span>)}</h1>
          <p className="about-description">{aboutContent.description}</p>
        </div>
        <img className="about-illustration" src="/about/library.svg" alt="Open book above a stack of library books beside a plant" width="340" height="201" />
      </section>
      <section className="about-features" aria-labelledby="about-features-heading">
        <h2 id="about-features-heading">{aboutContent.featuresTitle}</h2>
        <div className="about-grid">
          {aboutContent.features.map((feature, index) => (
            <article className="about-glass about-feature" key={feature.title}>
              <p className="about-feature-number">{String(index + 1).padStart(2, "0")}</p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="about-developers" aria-labelledby="about-developers-heading">
        <h2 id="about-developers-heading">{aboutContent.developersTitle}</h2>
        <p className="about-team-description">{aboutContent.developersDescription}</p>
        <Dialog>
          <div className="about-grid">
            {developers.map(developer => (
              <DialogTrigger key={developer.id} className="about-glass about-developer" onClick={() => setSelectedDeveloper(developer)} aria-label={`View ${developer.name}'s developer profile`}>
                <DeveloperPortrait developer={developer} />
                <h3>{developer.name}</h3>
                <p>{developer.role}</p>
                <span className="about-view-profile">View profile <span aria-hidden="true">↗</span></span>
              </DialogTrigger>
            ))}
          </div>
          {selectedDeveloper && (
            <DialogContent showCloseButton={false} className="about-dialog" overlayClassName="about-backdrop">
              <DialogClose className="about-dialog-close" aria-label="Close developer profile">×</DialogClose>
              <DeveloperPortrait key={selectedDeveloper.id} developer={selectedDeveloper} />
              <DialogTitle className="about-dialog-name">{selectedDeveloper.name}</DialogTitle>
              <DialogDescription className="about-dialog-role">{selectedDeveloper.role}</DialogDescription>
              {selectedDeveloper.bio && <p className="about-dialog-bio">{selectedDeveloper.bio}</p>}
              <div className="about-connect">
                <h3>Connect with developer</h3>
                <div className="about-socials">
                  {socialPlatforms.map(({ key, label, path }) => {
                    const url = validSocialUrl(selectedDeveloper.socials[key]);
                    return url ? (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${selectedDeveloper.name} on ${label} (opens in a new tab)`}>
                        {key === "instagram" ? <img src="/about/instagram.svg" width="24" height="24" alt="" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>}
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </section>
      <footer className="about-footer">{aboutContent.footer}</footer>
    </div>
  );
}
