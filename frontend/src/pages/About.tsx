import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen, UserRound } from "lucide-react";

// Replace these values with the project's final copy and developer details.
const project = {
  name: "Library Management System",
  description:
    "Our Library Management System brings books, library resources, and borrowing activities together in one easy-to-use place. It helps readers discover available books and track their loans, while giving librarians the tools to organize resources and manage borrowing and returns.",
  developmentNote:
    "This project is currently under development. Additional features and improvements are planned to make managing and using the library even simpler.",
};

type Developer = {
  id: string;
  name: string;
  role: string;
  image: string;
  socials: Partial<Record<"github" | "facebook" | "instagram", string>>;
};

const developers: Developer[] = [
  { id: "developer-1", name: "Eryck Jouhann V. Cadawas", role: "Decepticon", image: "/images/hojan.webp", socials: { github: "https://github.com/Hojannn", facebook: "https://www.facebook.com/jouhanncadawas", instagram: "https://www.instagram.com/hojaaann/?hl=en" } },
  { id: "developer-2", name: "Carl Jasper A. Ramos", role: "Backshot Developer", image: "/images/cj.webp", socials: { github: "https://github.com/zora-ao?fbclid=IwY2xjawVC_PtleHRuA2FlbQIxMQBwZG9mA3NydGMGYXBwX2lkATAAAR44MoM7B0RsS8slu3uZK2DWAcZQ65f8rh_KCKGQAl0CfuQe2-MFvG0nP7vqIQ_aem_YW85JSTpqUC9G7Bu-t_wHw", facebook: "https://www.facebook.com/carljaspera.ramos", instagram: "https://www.instagram.com/crldkl/" } },
  { id: "developer-3", name: "Dolf Louise P. Felipe", role: "Project Demo (Demolition)", image: "/images/dolf.webp", socials: { github: "https://github.com/aintlumii?fbclid=IwY2xjawVC_KtleHRuA2FlbQIxMQBwZG9mA3NydGMGYXBwX2lkATAAAR5eCTjynQr7KL4jq1t02_H6FMUrPd16Q_YqnkMU95QJO3RLQFzedAuVerYMsQ_aem_kly-EbMvYlZ_M92x-Qqlgw", facebook: "https://www.facebook.com/dolflouise.felipe", instagram: "https://www.instagram.com/aintlumi_?exln=MWxkdHJsd2MydXpxbA==" } },
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
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight">About Us</h1>
        <p className="text-sm text-muted-foreground">
          Get to know our project and the people behind it.
        </p>
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
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
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
              <Card key={developer.id} 
              className="
                relative
                ring-1 ring-foreground/10
                transition-all duration-200
                hover:-translate-y-1
                hover:shadow-md
                hover:ring-2
                hover:ring-[#7A5138]
                motion-reduce:transform-none
                motion-reduce:transition-none">
                <DialogTrigger
                  className="absolute inset-0 z-10 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`View ${developer.name}'s developer profile`}
                  onClick={() => setSelectedDeveloper(developer)}
                />
                <CardContent className="flex flex-col items-center gap-4 py-2 text-center">
                  <Avatar className="size-20">
                    {developer.image && (
                      <AvatarImage src={developer.image} alt={`${developer.name}'s profile`} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserRound
                        className="size-8"
                        role="img"
                        aria-label={`Placeholder profile for ${developer.name}`}
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{developer.name}</h3>
                    <p className="text-sm text-muted-foreground">{developer.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogContent
            overlayClassName="bg-black/50 duration-200 motion-reduce:animate-none"
            className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-border bg-card p-6 text-foreground shadow-xl ring-0 duration-200 sm:max-w-[440px] motion-reduce:animate-none"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="size-24">
                <AvatarImage src={selectedDeveloper.image} alt={`${selectedDeveloper.name}'s profile`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserRound className="size-10" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold leading-snug">{selectedDeveloper.name}</DialogTitle>
                <DialogDescription>{selectedDeveloper.role}</DialogDescription>
              </div>
              <div className="w-full space-y-3 border-t border-border pt-4">
                <h3 className="text-sm font-medium">Connect with Developer</h3>
                <div className="flex justify-center gap-3">
                  {socialPlatforms.map(({ key, label, path }) => {
                    const url = validSocialUrl(selectedDeveloper.socials[key]);
                    return url ? (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${selectedDeveloper.name} on ${label} (opens in a new tab)`}
                        className={buttonVariants({ variant: "outline", size: "icon-lg", className: "text-primary hover:border-primary/40 hover:bg-primary/10 hover:text-primary" })}
                      >
                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={path} />
                        </svg>
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
};

export default About;
