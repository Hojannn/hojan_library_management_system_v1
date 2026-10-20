import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  LayoutGrid,
  UserRound,
} from "lucide-react";

// Replace these values with the project's final copy and developer details.
const project = {
  name: "Library Management System",
  description:
    "Our Library Management System brings books, library resources, and borrowing activities together in one easy-to-use place. It helps readers discover available books and track their loans, while giving librarians the tools to organize resources and manage borrowing and returns.",
  developmentNote:
    "This project is currently under development. Additional features and improvements are planned to make managing and using the library even simpler.",
};

const features = [
  {
    icon: BookOpen,
    title: "Browse & discover",
    description: "Explore the catalog and find available titles by category.",
  },
  {
    icon: ArrowLeftRight,
    title: "Borrow & return",
    description: "Keep track of loans, due dates, and returned copies.",
  },
  {
    icon: LayoutGrid,
    title: "Manage the library",
    description: "Organize books, categories, users, and borrowing records.",
  },
];

const techStack = ["React", "TypeScript", "Tailwind CSS", "Flask", "PostgreSQL"];

type Developer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials: Partial<Record<"github" | "facebook" | "instagram", string>>;
};

const developers: Developer[] = [
  {
    id: "developer-1",
    name: "Eryck Jouhann V. Cadawas",
    role: "Decepticon",
    bio: "Focused on the frontend experience and the interfaces readers use every day.",
    image: "/images/hojan.webp",
    socials: {
      github: "https://github.com/Hojannn",
      facebook: "https://www.facebook.com/jouhanncadawas",
      instagram: "https://www.instagram.com/hojaaann/",
    },
  },
  {
    id: "developer-2",
    name: "Carl Jasper A. Ramos",
    role: "Backshot Developer",
    bio: "Works on the backend, data, and the services that keep the library running.",
    image: "/images/cj.webp",
    socials: {
      github: "https://github.com/zora-ao",
      facebook: "https://www.facebook.com/carljaspera.ramos",
      instagram: "https://www.instagram.com/crldkl/",
    },
  },
  {
    id: "developer-3",
    name: "Dolf Louise P. Felipe",
    role: "Project Demo (Demolition)",
    bio: "Helps shape and demonstrate the project from concept to working demo.",
    image: "/images/dolf.webp",
    socials: {
      github: "https://github.com/aintlumii",
      facebook: "https://www.facebook.com/dolflouise.felipe",
      instagram: "https://www.instagram.com/aintlumi_/",
    },
  },
];

const socialPlatforms = [
  { key: "github", label: "GitHub", path: "M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.9a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8S17.5.9 15 2.6a13 13 0 0 0-6 0C6.5.9 5.3 1.2 5.3 1.2a5 5 0 0 0-.1 3.8 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.2 6.9a3.4 3.4 0 0 0-.9 2.7v3.9" },
  { key: "facebook", label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { key: "instagram", label: "Instagram", path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17.5 6.5h.01" },
] as const;

function validSocialUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

const About = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer>(developers[0]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary via-secondary/60 to-primary/10 p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <Badge variant="secondary" className="gap-1.5 border border-primary/15">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Under Development
            </Badge>
          </div>
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Us</h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Get to know our project and the people behind it.
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="about-project-heading">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="size-5" aria-hidden="true" />
              </div>
              <Badge variant="secondary" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                Under Development
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">About the Project</p>
              <h2 id="about-project-heading" className="text-xl font-semibold tracking-tight">
                {project.name}
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-lg border border-border/70 bg-secondary/40 p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Built with
              </span>
              {techStack.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>

            <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              {project.developmentNote}
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="developers-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="developers-heading" className="text-xl font-semibold tracking-tight">
            Meet the Developers
          </h2>
          <p className="text-sm text-muted-foreground">
            The team building a better library experience.
          </p>
        </div>
        <Dialog>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((developer) => (
              <Card
                key={developer.id}
                className="group/card relative transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-primary/40 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <DialogTrigger
                  className="absolute inset-0 z-10 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`View ${developer.name}'s developer profile`}
                  onClick={() => setSelectedDeveloper(developer)}
                />
                <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
                  <Avatar className="size-20 ring-4 ring-secondary transition-transform duration-200 group-hover/card:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                    {developer.image && (
                      <AvatarImage src={developer.image} alt={`${developer.name}'s profile`} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserRound className="size-8" aria-hidden="true" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{developer.name}</h3>
                    <p className="text-sm text-muted-foreground">{developer.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    View profile
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-200 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogContent
            overlayClassName="bg-black/50 duration-200 motion-reduce:animate-none"
            className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl ring-0 duration-200 sm:max-w-[440px] motion-reduce:animate-none"
          >
            <div className="h-24 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary" aria-hidden="true" />
            <div className="flex flex-col items-center gap-3 px-6 pb-6 -mt-12 text-center">
              <Avatar className="size-24 ring-4 ring-card">
                <AvatarImage src={selectedDeveloper.image} alt={`${selectedDeveloper.name}'s profile`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserRound className="size-10" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold leading-snug">
                  {selectedDeveloper.name}
                </DialogTitle>
                <DialogDescription>{selectedDeveloper.role}</DialogDescription>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {selectedDeveloper.bio}
              </p>
              <div className="mt-2 w-full space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-medium">Connect with Developer</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {socialPlatforms.map(({ key, label, path }) => {
                    const url = validSocialUrl(selectedDeveloper.socials[key]);
                    return url ? (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${selectedDeveloper.name} on ${label} (opens in a new tab)`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "lg",
                          className: "gap-2 px-3 text-primary hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
                        })}
                      >
                        <svg
                          className="size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={path} />
                        </svg>
                        {label}
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Ready to explore the library?</h2>
          <p className="text-sm text-muted-foreground">
            Browse the catalog, check availability, and manage your borrowing.
          </p>
        </div>
        <Link to="/books" className={buttonVariants({ className: "gap-2" })}>
          Browse catalog
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default About;
